package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String category;

    @Column(length = 2000)
    private String description;

    private String priority;

    private String contactDetails;

    private String createdAt;

    private String status;

    private String assignedTechnician;

    @Column(length = 2000)
    private String resolutionNote;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "ticket_comments",
            joinColumns = @JoinColumn(name = "ticket_id")
    )
    @Column(name = "comment_text", length = 1000)
    private List<String> comments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "ticket_attachments",
            joinColumns = @JoinColumn(name = "ticket_id")
    )
    @Column(name = "attachment_name")
    private List<String> attachments = new ArrayList<>();

    public Ticket() {
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null || this.createdAt.isBlank()) {
            this.createdAt = LocalDateTime.now().toString();
        }

        if (this.status == null || this.status.isBlank()) {
            this.status = "OPEN";
        }

        if (this.assignedTechnician == null || this.assignedTechnician.isBlank()) {
            this.assignedTechnician = "Not Assigned";
        }

        if (this.resolutionNote == null || this.resolutionNote.isBlank()) {
            this.resolutionNote = "No resolution yet";
        }

        if (this.comments == null) {
            this.comments = new ArrayList<>();
        }

        if (this.attachments == null) {
            this.attachments = new ArrayList<>();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getContactDetails() {
        return contactDetails;
    }

    public void setContactDetails(String contactDetails) {
        this.contactDetails = contactDetails;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }

    public List<String> getComments() {
        return comments;
    }

    public void setComments(List<String> comments) {
        this.comments = comments;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }
}