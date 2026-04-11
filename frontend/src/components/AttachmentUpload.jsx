function AttachmentUpload() {
  return (
    <div className="card shadow p-4 mt-4">
      <h4 className="mb-3 text-secondary">Upload Attachments</h4>

      <div className="mb-3">
        <label className="form-label">Select Images (Maximum 3)</label>
        <input type="file" className="form-control" multiple />
      </div>

      <button className="btn btn-success">Upload Files</button>

      <div className="mt-3">
        <p className="mb-1"><strong>Sample Uploaded Files:</strong></p>
        <ul className="list-group">
          <li className="list-group-item">wifi_issue_1.jpg</li>
          <li className="list-group-item">wifi_issue_2.jpg</li>
        </ul>
      </div>
    </div>
  );
}

export default AttachmentUpload;