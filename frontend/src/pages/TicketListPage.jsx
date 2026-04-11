import { useState } from 'react';

function TicketListPage({ tickets, onViewDetails }) {
  const [searchText, setSearchText] = useState('');

  const filteredTickets = tickets.filter((ticket) => {
    const searchValue = searchText.toLowerCase();

    return (
      ticket.title.toLowerCase().includes(searchValue) ||
      ticket.category.toLowerCase().includes(searchValue) ||
      ticket.status.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-primary">All Incident Tickets</h2>

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, category, or status"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.category}</td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.status}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => onViewDetails(ticket)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketListPage;