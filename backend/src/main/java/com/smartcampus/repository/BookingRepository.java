package com.smartcampus.repository;

import com.smartcampus.model.entity.Booking;
import com.smartcampus.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserId(Long userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    List<Booking> findByResourceId(Long resourceId);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId AND b.bookingDate = :bookingDate AND b.status IN :statuses")
    List<Booking> findBookingsByResourceAndDate(
            @Param("resourceId") Long resourceId, 
            @Param("bookingDate") LocalDate bookingDate,
            @Param("statuses") List<BookingStatus> statuses);
            
    // Prevent double booking logic (finding overlapping bookings)
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resource.id = :resourceId AND b.bookingDate = :bookingDate " +
           "AND b.status IN (com.smartcampus.model.enums.BookingStatus.APPROVED, com.smartcampus.model.enums.BookingStatus.PENDING) " +
           "AND ((b.startTime <= :startTime AND b.endTime > :startTime) OR " +
           "(b.startTime < :endTime AND b.endTime >= :endTime) OR " +
           "(b.startTime >= :startTime AND b.endTime <= :endTime))")
    boolean existsOverlappingBooking(
            @Param("resourceId") Long resourceId, 
            @Param("bookingDate") LocalDate bookingDate, 
            @Param("startTime") LocalTime startTime, 
            @Param("endTime") LocalTime endTime);

    // Overlap check excluding a specific booking (used for updates)
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resource.id = :resourceId AND b.bookingDate = :bookingDate " +
           "AND b.id <> :excludeId " +
           "AND b.status IN (com.smartcampus.model.enums.BookingStatus.APPROVED, com.smartcampus.model.enums.BookingStatus.PENDING) " +
           "AND ((b.startTime <= :startTime AND b.endTime > :startTime) OR " +
           "(b.startTime < :endTime AND b.endTime >= :endTime) OR " +
           "(b.startTime >= :startTime AND b.endTime <= :endTime))")
    boolean existsOverlappingBookingExcluding(
            @Param("resourceId") Long resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId);
}
