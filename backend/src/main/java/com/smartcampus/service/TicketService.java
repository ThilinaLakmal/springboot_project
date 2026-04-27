package com.smartcampus.service;

import com.smartcampus.model.entity.Ticket;
import com.smartcampus.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Ticket createTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Optional<Ticket> updateTicketStatus(Long id, String status, String resolutionNote) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isPresent()) {
            Ticket ticket = optionalTicket.get();
            ticket.setStatus(status);
            ticket.setResolutionNote(resolutionNote);
            Ticket updatedTicket = ticketRepository.save(ticket);
            return Optional.of(updatedTicket);
        }

        return Optional.empty();
    }

    public Optional<Ticket> assignTechnician(Long id, String technicianName) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isPresent()) {
            Ticket ticket = optionalTicket.get();
            ticket.setAssignedTechnician(technicianName);
            Ticket updatedTicket = ticketRepository.save(ticket);
            return Optional.of(updatedTicket);
        }

        return Optional.empty();
    }

    public Optional<Ticket> addComment(Long id, String commentText) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isPresent()) {
            Ticket ticket = optionalTicket.get();

            if (ticket.getComments() == null) {
                ticket.setComments(new ArrayList<>());
            }

            ticket.getComments().add(commentText);

            Ticket updatedTicket = ticketRepository.save(ticket);
            return Optional.of(updatedTicket);
        }

        return Optional.empty();
    }

    public Optional<Ticket> addAttachment(Long id, String attachmentFileName) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isPresent()) {
            Ticket ticket = optionalTicket.get();

            if (ticket.getAttachments() == null) {
                ticket.setAttachments(new ArrayList<>());
            }

            if (ticket.getAttachments().size() >= 3) {
                throw new IllegalStateException("Maximum 3 attachments allowed");
            }

            ticket.getAttachments().add(attachmentFileName);

            Ticket updatedTicket = ticketRepository.save(ticket);
            return Optional.of(updatedTicket);
        }

        return Optional.empty();
    }

    public Optional<Ticket> deleteComment(Long id, int commentIndex) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isPresent()) {
            Ticket ticket = optionalTicket.get();

            if (ticket.getComments() == null || commentIndex < 0 || commentIndex >= ticket.getComments().size()) {
                throw new IllegalArgumentException("Invalid comment index");
            }

            ticket.getComments().remove(commentIndex);

            Ticket updatedTicket = ticketRepository.save(ticket);
            return Optional.of(updatedTicket);
        }

        return Optional.empty();
    }

    public Optional<Ticket> deleteAttachment(Long id, int attachmentIndex) {
        Optional<Ticket> optionalTicket = ticketRepository.findById(id);

        if (optionalTicket.isPresent()) {
            Ticket ticket = optionalTicket.get();

            if (ticket.getAttachments() == null || attachmentIndex < 0 || attachmentIndex >= ticket.getAttachments().size()) {
                throw new IllegalArgumentException("Invalid attachment index");
            }

            ticket.getAttachments().remove(attachmentIndex);

            Ticket updatedTicket = ticketRepository.save(ticket);
            return Optional.of(updatedTicket);
        }

        return Optional.empty();
    }
}