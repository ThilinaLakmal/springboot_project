import { useEffect, useState } from 'react';
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
  const [previewData, setPreviewData] = useState({
    title: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    if (ticket) {
      setPreviewData({
        title: ticket.title || '',
        category: ticket.category || '',
        description: ticket.description || '',
      });
    }
  }, [ticket]);

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

  const handlePreviewChange = (event) => {
    const { name, value } = event.target;

    setPreviewData({
      ...previewData,
      [name]: value,
    });
  };

  const handlePreviewReset = () => {
    setPreviewData({
      title: ticket.title || '',
      category: ticket.category || '',
      description: ticket.description || '',
    });
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
                <p><strong>Created At:</strong> {ticket.createdAt}</p>
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
                <p className="mb-2"><strong>Created At:</strong> {ticket.createdAt}</p>
                <p className="mb-0"><strong>Contact:</strong> {ticket.contactDetails}</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <p className="mb-2"><strong>Priority:</strong> {ticket.priority}</p>
                <p className="mb-2"><strong>Status:</strong> {ticket.status}</p>
                <p className="mb-2"><strong>Technician:</strong> {ticket.assignedTechnician}</p>
                <p className="mb-0">
                  <strong>Attachments:</strong> {ticket.attachments?.length ?? 0}
                </p>
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
              <h3 className="text-primary mb-0">{ticket.comments?.length ?? 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <h6 className="text-muted">Attachments</h6>
              <h3 className="text-success mb-0">{ticket.attachments?.length ?? 0}</h3>
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

      <div className="card shadow-sm border mb-4">
        <div className="card-body p-4">
          <h4 className="text-dark mb-3">Editable Preview Card</h4>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h5 className="text-secondary mb-3">Edit Preview Fields</h5>

                <div className="mb-3">
                  <label className="form-label">Preview Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={previewData.title}
                    onChange={handlePreviewChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Preview Category</label>
                  <select
                    name="category"
                    className="form-select"
                    value={previewData.category}
                    onChange={handlePreviewChange}
                  >
                    <option value="Network">Network</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Account">Account</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Preview Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="5"
                    value={previewData.description}
                    onChange={handlePreviewChange}
                  ></textarea>
                </div>

                <button
                  className="btn btn-outline-secondary"
                  onClick={handlePreviewReset}
                >
                  Reset Preview
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100 bg-light">
                <h5 className="text-secondary mb-3">Preview Output</h5>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="text-primary">{previewData.title || 'No title'}</h5>
                    <p className="mb-2">
                      <strong>Category:</strong> {previewData.category || 'No category'}
                    </p>
                    <p className="mb-0">
                      <strong>Description:</strong>{' '}
                      {previewData.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <small className="text-muted">
                    This preview is for UI demonstration only. It does not permanently update the ticket.
                  </small>
                </div>
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