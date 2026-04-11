package com.example.backend.controller;

import com.example.backend.model.Ticket;
import com.example.backend.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket savedTicket = ticketService.createTicket(ticket);
        return new ResponseEntity<>(savedTicket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .<ResponseEntity<?>>map(ticket -> new ResponseEntity<>(ticket, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>("Ticket not found", HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody
    ) {
        String status = requestBody.get("status");
        String resolutionNote = requestBody.get("resolutionNote");

        if (status == null || status.isBlank()) {
            return new ResponseEntity<>("Status is required", HttpStatus.BAD_REQUEST);
        }

        if (resolutionNote == null) {
            resolutionNote = "";
        }

        return ticketService.updateTicketStatus(id, status, resolutionNote)
                .<ResponseEntity<?>>map(ticket -> new ResponseEntity<>(ticket, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>("Ticket not found", HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}/assign-technician")
    public ResponseEntity<?> assignTechnician(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody
    ) {
        String technicianName = requestBody.get("assignedTechnician");

        if (technicianName == null || technicianName.isBlank()) {
            return new ResponseEntity<>("Technician name is required", HttpStatus.BAD_REQUEST);
        }

        return ticketService.assignTechnician(id, technicianName)
                .<ResponseEntity<?>>map(ticket -> new ResponseEntity<>(ticket, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>("Ticket not found", HttpStatus.NOT_FOUND));
    }
}