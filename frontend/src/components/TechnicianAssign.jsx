function TechnicianAssign() {
  return (
    <div className="card shadow p-4 mt-4">
      <h4 className="mb-3 text-secondary">Assign Technician</h4>

      <div className="mb-3">
        <label className="form-label">Select Technician</label>
        <select className="form-select">
          <option>Not Assigned</option>
          <option>Thilin Abeykoon</option>
          <option>Technician 2</option>
          <option>Technician 3</option>
        </select>
      </div>

      <button className="btn btn-dark">Assign Technician</button>
    </div>
  );
}

export default TechnicianAssign;