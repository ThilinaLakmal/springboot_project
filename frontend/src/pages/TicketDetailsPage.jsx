import CommentsSection from '../components/CommentsSection';
import AttachmentUpload from '../components/AttachmentUpload';
import StatusUpdate from '../components/StatusUpdate';
import TechnicianAssign from '../components/TechnicianAssign';

function TicketDetailsPage({
  ticket,
  showNewTicketNotice,
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
      {showNewTicketNotice && (
        <div className="alert alert-success">
          New ticket created successfully. Ticket ID: <strong>{ticket.id}</strong>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="text-primary mb-0">Ticket Details</h2>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-secondary"
            onClick={() => window.print()}
          >
            Print Summary
          </button>

          <button className="btn btn-outline-primary" onClick={onBackToList}>
            Back to Ticket List
          </button>
        </div>
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

      <div className="card shadow-sm border mb-4 bg-white">
        <div className="card-body p-4">
          <h4 className="text-dark mb-3">Print-Friendly Ticket Summary</h4>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <p className="mb-2"><strong>Ticket ID:</strong> {ticket.id}</p>
                <p className="mb-2"><strong>Title:</strong> {ticket.title}</p>
                <p className="mb-2"><strong>Category:</strong> {ticket.category}</p>
                <p className="mb-0"><strong>Contact:</strong> {ticket.contactDetails}</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <p className="mb-2"><strong>Priority:</strong> {ticket.priority}</p>
                <p className="mb-2"><strong>Status:</strong> {ticket.status}</p>
                <p className="mb-2"><strong>Technician:</strong> {ticket.assignedTechnician}</p>
                <p className="mb-0"><strong>Attachments:</strong> {ticket.attachments.length}</p>
              </div>
            </div>

            <div className="col-12">
              <div className="border rounded p-3">
                <p className="mb-2"><strong>Description:</strong></p>
                <p className="mb-3">{ticket.description}</p>

                <p className="mb-2"><strong>Resolution Note:</strong></p>
                <p className="mb-0">{ticket.resolutionNote || 'No resolution yet'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">Comments</h6>
              <h3 className="text-primary mb-0">{ticket.comments.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">Attachments</h6>
              <h3 className="text-success mb-0">{ticket.attachments.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">Current Status</h6>
              <div className="mt-2">
                <span className={`badge fs-6 ${getStatusBadgeClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">Technician</h6>
              <h6 className="text-dark mb-0 mt-2">{ticket.assignedTechnician}</h6>
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