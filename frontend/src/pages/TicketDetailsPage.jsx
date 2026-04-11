import CommentsSection from '../components/CommentsSection';
import AttachmentUpload from '../components/AttachmentUpload';
import StatusUpdate from '../components/StatusUpdate';
import TechnicianAssign from '../components/TechnicianAssign';

function TicketDetailsPage({
  ticket,
  onUpdateStatus,
  onAssignTechnician,
  onAddComment,
  onDeleteComment,
  onAddAttachment,
}) {
  if (!ticket) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">No ticket selected.</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-primary">Ticket Details</h2>

        <p><strong>ID:</strong> {ticket.id}</p>
        <p><strong>Title:</strong> {ticket.title}</p>
        <p><strong>Category:</strong> {ticket.category}</p>
        <p><strong>Description:</strong> {ticket.description}</p>
        <p><strong>Priority:</strong> {ticket.priority}</p>
        <p><strong>Contact Details:</strong> {ticket.contactDetails}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
        <p><strong>Assigned Technician:</strong> {ticket.assignedTechnician}</p>
        <p><strong>Resolution Note:</strong> {ticket.resolutionNote}</p>
      </div>

      <CommentsSection
        ticket={ticket}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />

      <AttachmentUpload ticket={ticket} onAddAttachment={onAddAttachment} />

      <StatusUpdate ticket={ticket} onUpdateStatus={onUpdateStatus} />

      <TechnicianAssign
        ticket={ticket}
        onAssignTechnician={onAssignTechnician}
      />
    </div>
  );
}

export default TicketDetailsPage;