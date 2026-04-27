import { useState } from 'react';

function CommentsSection({ ticket, onAddComment, onDeleteComment }) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (commentText.trim() === '') {
      alert('Please enter a comment.');
      return;
    }

    try {
      setSubmitting(true);
      await onAddComment(ticket.id, commentText);
      setCommentText('');
      alert('Comment added successfully!');
    } catch (error) {
      console.error('Add comment error:', error);
      alert('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentIndex) => {
    try {
      await onDeleteComment(ticket.id, commentIndex);
      alert('Comment deleted successfully!');
    } catch (error) {
      console.error('Delete comment error:', error);
      alert('Failed to delete comment.');
    }
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

        <button type="submit" className="btn btn-primary mb-3" disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      <ul className="list-group">
        {ticket.comments.length > 0 ? (
          ticket.comments.map((comment, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>Comment {index + 1}:</strong> {comment}
              </div>

              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
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