package com.smartcampus.service;

import com.smartcampus.dto.BookingDto;
import java.util.List;

public interface BookingService {
    List<BookingDto> getAllBookings();
    List<BookingDto> getBookingsByStatus(String status);
    BookingDto getBookingById(Long id);
    List<BookingDto> getUserBookings(Long userId);
    List<BookingDto> getUserBookingsByStatus(Long userId, String status);
    List<BookingDto> getBookingsByResource(Long resourceId);
    BookingDto createBooking(BookingDto bookingDto);
    BookingDto approveBooking(Long id, String reason);
    BookingDto rejectBooking(Long id, String reason);
    BookingDto cancelBooking(Long id);
    BookingDto checkIn(Long resourceId, Long userId);
    void deleteBooking(Long id);
}
