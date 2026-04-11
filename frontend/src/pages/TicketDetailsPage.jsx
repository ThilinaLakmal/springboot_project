import CommentsSection from '../components/CommentsSection';
import AttachmentUpload from '../components/AttachmentUpload';
import StatusUpdate from '../components/StatusUpdate';
import TechnicianAssign from '../components/TechnicianAssign';

function TicketDetailsPage({
  ticket,
  onBackToList,
  onUpdateStatus,
  onAssignTechnician,
  onAddComment,
  onDeleteComment,
  onAddAttachment,
  onDeleteAttachment,
}) {
  if (!ticket) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">No ticket selected.</div>
      </div>
    );
  }

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'High') {
      return 'bg-danger';
    }

    if (priority === 'Medium') {
      return 'bg-warning text-dark';
    }

    return 'bg-success';
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'OPEN') {
      return 'bg-primary';
    }

    if (status === 'IN_PROGRESS') {
      return 'bg-warning text-dark';
    }

    if (status === 'RESOLVED') {
      return 'bg-success';
    }

    if (status === 'CLOSED') {
      return 'bg-secondary';
    }

    return 'bg-dark';
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="text-primary mb-0">Ticket Details</h2>

        <button className="btn btn-outline-primary" onClick={onBackToList}>
          Back to Ticket List
        </button>
      </div>

      <div className="card shadow border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h4 className="mb-0 text-dark">{ticket.title}</h4>
            <span className="badge bg-dark fs-6">Ticket #{ticket.id}</span>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h5 className="text-secondary mb-3">Basic Information</h5>
                <p><strong>Category:</strong> {ticket.category}</p>
                <p><strong>Contact Details:</strong> {ticket.contactDetails}</p>
                <p>
                  <strong>Priority:</strong>{' '}
                  <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h5 className="text-secondary mb-3">Assignment & Resolution</h5>
                <p><strong>Assigned Technician:</strong> {ticket.assignedTechnician}</p>
                <p className="mb-0">
                  <strong>Resolution Note:</strong>{' '}
                  {ticket.resolutionNote || 'No resolution yet'}
                </p>
              </div>
            </div>

            <div className="col-12">
              <div className="border rounded p-3">
                <h5 className="text-secondary mb-3">Issue Description</h5>
                <p className="mb-0">{ticket.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommentsSection
        ticket={ticket}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />

      <AttachmentUpload
        ticket={ticket}
        onAddAttachment={onAddAttachment}
        onDeleteAttachment={onDeleteAttachment}
      />

      <StatusUpdate ticket={ticket} onUpdateStatus={onUpdateStatus} />

      <TechnicianAssign
        ticket={ticket}
        onAssignTechnician={onAssignTechnician}
      />
    </div>
  );
}

export default TicketDetailsPage;