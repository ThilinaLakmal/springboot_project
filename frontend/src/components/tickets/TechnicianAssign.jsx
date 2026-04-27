import { useEffect, useState } from 'react';

function TechnicianAssign({ ticket, onAssignTechnician }) {
  const [technician, setTechnician] = useState(
    ticket?.assignedTechnician || 'Not Assigned'
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTechnician(ticket?.assignedTechnician || 'Not Assigned');
  }, [ticket]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await onAssignTechnician(ticket.id, technician);
      alert('Technician assigned successfully!');
    } catch (error) {
      console.error('Assign technician error:', error);
      alert('Failed to assign technician.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow p-4 mt-4">
      <h4 className="mb-3 text-secondary">Assign Technician</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Select Technician</label>
          <select
            className="form-select"
            value={technician}
            onChange={(event) => setTechnician(event.target.value)}
          >
            <option>Not Assigned</option>
            <option>Thilin Abeykoon</option>
            <option>Technician 2</option>
            <option>Technician 3</option>
          </select>
        </div>

        <button type="submit" className="btn btn-dark" disabled={submitting}>
          {submitting ? 'Assigning...' : 'Assign Technician'}
        </button>
      </form>
    </div>
  );
}

export default TechnicianAssign;