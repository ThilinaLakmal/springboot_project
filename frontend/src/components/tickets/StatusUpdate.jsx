import { useEffect, useState } from 'react';

function StatusUpdate({ ticket, onUpdateStatus }) {
  const [status, setStatus] = useState(ticket?.status || 'OPEN');
  const [resolutionNote, setResolutionNote] = useState(ticket?.resolutionNote || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setStatus(ticket?.status || 'OPEN');
    setResolutionNote(ticket?.resolutionNote || '');
  }, [ticket]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await onUpdateStatus(ticket.id, status, resolutionNote);
      alert('Ticket status updated successfully!');
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow p-4 mt-4">
      <h4 className="mb-3 text-secondary">Update Ticket Status</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Select Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>OPEN</option>
            <option>IN_PROGRESS</option>
            <option>RESOLVED</option>
            <option>CLOSED</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Resolution Note</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter resolution note"
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-warning" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Status'}
        </button>
      </form>
    </div>
  );
}

export default StatusUpdate;