import { useState } from 'react';

function CreateTicketPage() {
  const [ticketData, setTicketData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'Low',
    contactDetails: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setTicketData({
      ...ticketData,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log('Ticket Submitted:', ticketData);
    alert('Ticket submitted successfully!');

    setTicketData({
      title: '',
      category: '',
      description: '',
      priority: 'Low',
      contactDetails: '',
    });
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-primary">Create Incident Ticket</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="Enter ticket title"
              value={ticketData.title}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <input
              type="text"
              name="category"
              className="form-control"
              placeholder="Enter category"
              value={ticketData.category}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="4"
              placeholder="Describe the issue"
              value={ticketData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              className="form-select"
              value={ticketData.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Details</label>
            <input
              type="text"
              name="contactDetails"
              className="form-control"
              placeholder="Enter contact details"
              value={ticketData.contactDetails}
              onChange={handleChange}
            />
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