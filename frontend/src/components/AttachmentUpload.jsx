import { useState } from 'react';

function AttachmentUpload({ ticket, onAddAttachment }) {
  const [fileName, setFileName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (fileName.trim() === '') {
      alert('Please enter a file name.');
      return;
    }

    onAddAttachment(ticket.id, fileName);
    setFileName('');
  };

  return (
    <div className="card shadow p-4 mt-4">
      <h4 className="mb-3 text-secondary">Upload Attachments</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Attachment File Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter file name"
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-success">
          Upload File
        </button>
      </form>

      <div className="mt-3">
        <p className="mb-1">
          <strong>Uploaded Files:</strong>
        </p>

        <ul className="list-group">
          {ticket.attachments.length > 0 ? (
            ticket.attachments.map((file, index) => (
              <li key={index} className="list-group-item">
                {file}
              </li>
            ))
          ) : (
            <li className="list-group-item">No attachments uploaded yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AttachmentUpload;