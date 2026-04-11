function CommentsSection() {
  const comments = [
    { id: 1, user: "Kavin", message: "Please check this issue soon." },
    { id: 2, user: "Technician", message: "I am currently investigating this problem." },
  ];

  return (
    <div className="card shadow p-4 mt-4">
      <h4 className="mb-3 text-secondary">Comments</h4>

      <div className="mb-3">
        <textarea
          className="form-control"
          rows="3"
          placeholder="Enter your comment"
        ></textarea>
      </div>

      <button className="btn btn-primary mb-3">Add Comment</button>

      <ul className="list-group">
        {comments.map((comment) => (
          <li key={comment.id} className="list-group-item">
            <strong>{comment.user}:</strong> {comment.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CommentsSection;