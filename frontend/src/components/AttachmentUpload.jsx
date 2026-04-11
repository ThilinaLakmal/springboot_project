import { useState } from 'react';

function AttachmentUpload({ ticket, onAddAttachment, onDeleteAttachment }) {
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingFile, setDeletingFile] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedFileName = fileName.trim();

    if (!trimmedFileName) {
      alert('Please enter a file name.');
      return;
    }

    try {
      setSubmitting(true);
      await onAddAttachment(ticket.id, trimmedFileName);
      setFileName('');
      alert('Attachment added successfully!');
    } catch (error) {
      console.error('Add attachment error:', error);
      alert(error.message || 'Failed to add attachment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (fileNameToDelete) => {
    try {
      setDeletingFile(fileNameToDelete);
      await onDeleteAttachment(ticket.id, fileNameToDelete);
      alert('Attachment removed successfully!');
    } catch (error) {
      console.error('Delete attachment error:', error);
      alert(error.message || 'Failed to delete attachment.');
    } finally {
      setDeletingFile('');
    }
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
            disabled={submitting}
          />
          <div className="form-text">
            You can keep up to 3 attachments for one ticket.
          </div>
        </div>

        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      <div className="mt-3">
        <p className="mb-1">
          <strong>Uploaded Files:</strong>
        </p>

        <ul className="list-group">
          {ticket.attachments && ticket.attachments.length > 0 ? (
            ticket.attachments.map((file, index) => (
              <li
                key={`${file}-${index}`}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{file}</span>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(file)}
                  disabled={deletingFile === file}
                >
                  {deletingFile === file ? 'Removing...' : 'Remove'}
                </button>
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