function CreateTicketPage() {
  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-primary">Create Incident Ticket</h2>

        <form>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input type="text" className="form-control" placeholder="Enter ticket title" />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <input type="text" className="form-control" placeholder="Enter category" />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="4" placeholder="Describe the issue"></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Priority</label>
            <select className="form-select">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Details</label>
            <input type="text" className="form-control" placeholder="Enter contact details" />
          </div>

          <button type="submit" className="btn btn-success">
            Submit Ticket
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTicketPage;