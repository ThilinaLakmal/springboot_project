package com.smartcampus.service;

import com.smartcampus.dto.BookingDto;
import com.smartcampus.model.entity.Booking;
import com.smartcampus.model.entity.Resource;
import com.smartcampus.model.entity.User;
import com.smartcampus.model.enums.BookingStatus;
import com.smartcampus.model.enums.NotificationType;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<BookingDto> getBookingsByStatus(String status) {
        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
        return bookingRepository.findByStatus(bookingStatus).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return mapToDto(booking);
    }

    @Override
    public List<BookingDto> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<BookingDto> getUserBookingsByStatus(Long userId, String status) {
        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
        return bookingRepository.findByUserIdAndStatus(userId, bookingStatus).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<BookingDto> getBookingsByResource(Long resourceId) {
        return bookingRepository.findByResourceId(resourceId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingDto createBooking(BookingDto dto) {
        log.info("Creating booking for resourceId: {} by userId: {}", dto.getResourceId(), dto.getUserId());
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + dto.getResourceId()));
        
        Long userId = dto.getUserId() != null ? dto.getUserId() : 1L;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        LocalTime start = LocalTime.parse(dto.getStartTime());
        LocalTime end = LocalTime.parse(dto.getEndTime());

        // Validate start time is before end time
        if (!start.isBefore(end)) {
            throw new ValidationException("Start time must be before end time");
        }

        // Validate booking time is within resource availability
        if (start.isBefore(resource.getAvailableFrom()) || end.isAfter(resource.getAvailableTo())) {
            log.warn("Booking time {} - {} outside available hours {} - {}", start, end, resource.getAvailableFrom(), resource.getAvailableTo());
            throw new ValidationException("Booking time falls outside of resource available hours (" 
                + resource.getAvailableFrom() + " - " + resource.getAvailableTo() + ")");
        }

        // Check for scheduling conflicts
        boolean isOverlapping = bookingRepository.existsOverlappingBooking(resource.getId(), dto.getBookingDate(), start, end);
        if (isOverlapping) {
            log.warn("Overlapping booking requested for resourceId: {} on date: {}", resource.getId(), dto.getBookingDate());
            throw new BookingConflictException("Resource is already booked for this time slot. Please choose a different time.");
        }

        // Validate expected attendees against resource capacity
        if (dto.getExpectedAttendees() != null && dto.getExpectedAttendees() > resource.getCapacity()) {
            throw new ValidationException("Expected attendees (" + dto.getExpectedAttendees() 
                + ") exceeds resource capacity (" + resource.getCapacity() + ")");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .bookingDate(dto.getBookingDate())
                .startTime(start)
                .endTime(end)
                .status(BookingStatus.PENDING)
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .build();

        booking = bookingRepository.save(booking);
        log.info("Booking created successfully with ID: {}", booking.getId());

        // Send notification to the user that their booking is pending
        try {
            notificationService.createNotification(
                    user.getId(),
                    "Your booking for '" + resource.getName() + "' on " + dto.getBookingDate()
                            + " (" + dto.getStartTime() + " - " + dto.getEndTime() + ") has been submitted and is PENDING approval.",
                    NotificationType.BOOKING
            );
        } catch (Exception e) {
            log.warn("Failed to send booking creation notification: {}", e.getMessage());
        }

        return mapToDto(booking);
    }

    @Override
    @Transactional
    public BookingDto approveBooking(Long id, String reason) {
        log.info("Approving booking ID: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ValidationException("Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminReason(reason);
        booking = bookingRepository.save(booking);
        log.info("Booking ID: {} approved successfully", id);

        // Notify the user that their booking was approved
        try {
            String message = "Your booking for '" + booking.getResource().getName() + "' on "
                    + booking.getBookingDate() + " (" + booking.getStartTime() + " - " + booking.getEndTime()
                    + ") has been APPROVED.";
            if (reason != null && !reason.isBlank()) {
                message += " Admin note: " + reason;
            }
            notificationService.createNotification(booking.getUser().getId(), message, NotificationType.BOOKING);
        } catch (Exception e) {
            log.warn("Failed to send booking approval notification: {}", e.getMessage());
        }

        return mapToDto(booking);
    }

    @Override
    @Transactional
    public BookingDto rejectBooking(Long id, String reason) {
        log.info("Rejecting booking ID: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ValidationException("Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        booking = bookingRepository.save(booking);
        log.info("Booking ID: {} rejected successfully", id);

        // Notify the user that their booking was rejected
        try {
            String message = "Your booking for '" + booking.getResource().getName() + "' on "
                    + booking.getBookingDate() + " (" + booking.getStartTime() + " - " + booking.getEndTime()
                    + ") has been REJECTED.";
            if (reason != null && !reason.isBlank()) {
                message += " Reason: " + reason;
            }
            notificationService.createNotification(booking.getUser().getId(), message, NotificationType.BOOKING);
        } catch (Exception e) {
            log.warn("Failed to send booking rejection notification: {}", e.getMessage());
        }

        return mapToDto(booking);
    }

    @Override
    @Transactional
    public BookingDto cancelBooking(Long id) {
        log.info("Cancelling booking ID: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new ValidationException("Only PENDING or APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        log.info("Booking ID: {} cancelled successfully", id);
        return mapToDto(booking);
    }

    @Override
    @Transactional
    public BookingDto checkIn(Long resourceId, Long userId) {
        log.info("Check-in attempt for resourceId: {} by userId: {}", resourceId, userId);

        // Verify resource exists
        resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + resourceId));

        // Find approved bookings for this resource and user today
        java.time.LocalDate today = java.time.LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Booking> approvedBookings = bookingRepository.findApprovedBookingsForCheckIn(resourceId, userId, today);

        if (approvedBookings.isEmpty()) {
            throw new ValidationException("No approved booking found for this resource today. Please ensure your booking is approved before checking in.");
        }

        // Find a booking within the check-in time window: 15 min before to 30 min after start time
        Booking matchingBooking = null;
        for (Booking booking : approvedBookings) {
            LocalTime windowStart = booking.getStartTime().minusMinutes(15);
            LocalTime windowEnd = booking.getStartTime().plusMinutes(30);

            if (!now.isBefore(windowStart) && !now.isAfter(windowEnd)) {
                matchingBooking = booking;
                break;
            }
        }

        if (matchingBooking == null) {
            // Build helpful error message showing what bookings exist
            StringBuilder sb = new StringBuilder("Check-in is only allowed 15 minutes before to 30 minutes after your booking start time. Your bookings today: ");
            for (Booking b : approvedBookings) {
                sb.append(b.getStartTime()).append(" - ").append(b.getEndTime()).append("; ");
            }
            throw new ValidationException(sb.toString());
        }

        matchingBooking.setStatus(BookingStatus.CHECKED_IN);
        matchingBooking = bookingRepository.save(matchingBooking);
        log.info("Check-in successful for booking ID: {} at resource: {}", matchingBooking.getId(), resourceId);
        return mapToDto(matchingBooking);
    }

    @Override
    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Booking not found with ID: " + id);
        }
        bookingRepository.deleteById(id);
        log.info("Booking ID: {} deleted permanently", id);
    }

    private BookingDto mapToDto(Booking booking) {
        return BookingDto.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .resourceLocation(booking.getResource().getLocation())
                .resourceType(booking.getResource().getType() != null ? booking.getResource().getType().getName() : null)
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getUsername())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime().toString())
                .endTime(booking.getEndTime().toString())
                .status(booking.getStatus().name())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .adminReason(booking.getAdminReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
