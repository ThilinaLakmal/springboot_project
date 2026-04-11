import { useState } from 'react';

function CommentsSection({ ticket, onAddComment, onDeleteComment }) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (commentText.trim() === '') {
      alert('Please enter a comment.');
      return;
    }

    onAddComment(ticket.id, commentText);
    setCommentText('');
    alert('Comment added successfully!');
  };

  const handleDelete = (commentId) => {
    onDeleteComment(ticket.id, commentId);
    alert('Comment deleted successfully!');
  };

  return (
    <div className="card shadow p-4 mt-4">
      <h4 className="mb-3 text-secondary">Comments</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter your comment"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary mb-3">
          Add Comment
        </button>
      </form>

      <ul className="list-group">
        {ticket.comments.length > 0 ? (
          ticket.comments.map((comment) => (
            <li
              key={comment.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{comment.user}:</strong> {comment.message}
              </div>

              {comment.user === 'thilini' && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))
        ) : (
          <li className="list-group-item">No comments yet.</li>
        )}
      </ul>
    </div>
  );
}

export default CommentsSection;