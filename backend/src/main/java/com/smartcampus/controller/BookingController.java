package com.smartcampus.controller;

import com.smartcampus.dto.BookingDto;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor

public class BookingController {

    private final BookingService bookingService;

    // GET /api/v1/bookings?status=PENDING (optional filter)
    @GetMapping
    public ResponseEntity<List<BookingDto>> getAllBookings(@RequestParam(value = "status", required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET /api/v1/bookings/{id}
    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // GET /api/v1/bookings/user/{userId}?status=PENDING (optional filter)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingDto>> getUserBookings(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "status", required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(bookingService.getUserBookingsByStatus(userId, status));
        }
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    // GET /api/v1/bookings/resource/{resourceId}
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingDto>> getBookingsByResource(@PathVariable("resourceId") Long resourceId) {
        return ResponseEntity.ok(bookingService.getBookingsByResource(resourceId));
    }

    // POST /api/v1/bookings
    @PostMapping
    public ResponseEntity<BookingDto> createBooking(@Valid @RequestBody BookingDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(dto));
    }

    // PUT /api/v1/bookings/{id}/approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingDto> approveBooking(
            @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null) ? body.get("reason") : null;
        return ResponseEntity.ok(bookingService.approveBooking(id, reason));
    }

    // PUT /api/v1/bookings/{id}/reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingDto> rejectBooking(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }

    // PATCH /api/v1/bookings/{id}/cancel
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDto> cancelBooking(@PathVariable("id") Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // PUT /api/v1/bookings/{id}/status (legacy - keep for backward compatibility)
    @PutMapping("/{id}/status")
    public ResponseEntity<BookingDto> updateBookingStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        String upperStatus = status.toUpperCase();
        switch (upperStatus) {
            case "APPROVED":
                return ResponseEntity.ok(bookingService.approveBooking(id, null));
            case "REJECTED":
                return ResponseEntity.ok(bookingService.rejectBooking(id, null));
            case "CANCELLED":
                return ResponseEntity.ok(bookingService.cancelBooking(id));
            default:
                throw new IllegalArgumentException("Invalid status: " + status);
        }
    }

    // DELETE /api/v1/bookings/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable("id") Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
