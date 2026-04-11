import { useState } from 'react';

function CreateTicketPage({ onAddTicket }) {
  const initialFormData = {
    title: '',
    category: '',
    description: '',
    priority: 'Low',
    contactDetails: '',
    attachmentFileName: '',
  };

  const [ticketData, setTicketData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setTicketData({
      ...ticketData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: '',
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (ticketData.title.trim() === '') {
      newErrors.title = 'Title is required.';
    }

    if (ticketData.category.trim() === '') {
      newErrors.category = 'Category is required.';
    }

    if (ticketData.description.trim() === '') {
      newErrors.description = 'Description is required.';
    }

    if (ticketData.contactDetails.trim() === '') {
      newErrors.contactDetails = 'Contact details are required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setTicketData(initialFormData);
    setErrors({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      alert('Please fill in all required fields.');
      return;
    }

    onAddTicket(ticketData);

    alert('Ticket submitted successfully!');

    setTicketData(initialFormData);
    setErrors({});
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
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="Enter ticket title"
              value={ticketData.title}
              onChange={handleChange}
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              name="category"
              className={`form-select ${errors.category ? 'is-invalid' : ''}`}
              value={ticketData.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              <option value="Network">Network</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Account">Account</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <div className="invalid-feedback">{errors.category}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows="4"
              placeholder="Describe the issue"
              value={ticketData.description}
              onChange={handleChange}
            ></textarea>
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
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
              className={`form-control ${errors.contactDetails ? 'is-invalid' : ''}`}
              placeholder="Enter contact details"
              value={ticketData.contactDetails}
              onChange={handleChange}
            />
            {errors.contactDetails && (
              <div className="invalid-feedback">{errors.contactDetails}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Initial Attachment File Name</label>
            <input
              type="text"
              name="attachmentFileName"
              className="form-control"
              placeholder="Enter file name if available"
              value={ticketData.attachmentFileName}
              onChange={handleChange}
            />
            <div className="form-text">
              This is optional. You can also add more attachments later in Ticket Details.
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success">
              Submit Ticket
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicketPage;