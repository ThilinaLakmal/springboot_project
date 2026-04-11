function StatusUpdate() {
  return (
    <div className="card shadow p-4 mt-4">
      <h4 className="mb-3 text-secondary">Update Ticket Status</h4>

      <div className="mb-3">
        <label className="form-label">Select Status</label>
        <select className="form-select">
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
        ></textarea>
      </div>

      <button className="btn btn-warning">Update Status</button>
    </div>
  );
}

export default StatusUpdate;