import { useState } from 'react';

function TicketListPage({ tickets, onViewDetails }) {
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTickets = tickets.filter((ticket) => {
    const searchValue = searchText.toLowerCase();

    const matchesSearch =
      ticket.title.toLowerCase().includes(searchValue) ||
      ticket.category.toLowerCase().includes(searchValue) ||
      ticket.status.toLowerCase().includes(searchValue);

    const matchesPriority =
      priorityFilter === 'All' || ticket.priority === priorityFilter;

    const matchesStatus =
      statusFilter === 'All' || ticket.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'High') {
      return 'bg-danger';
    }

    if (priority === 'Medium') {
      return 'bg-warning text-dark';
    }

    return 'bg-success';
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'OPEN') {
      return 'bg-primary';
    }

    if (status === 'IN_PROGRESS') {
      return 'bg-warning text-dark';
    }

    if (status === 'RESOLVED') {
      return 'bg-success';
    }

    if (status === 'CLOSED') {
      return 'bg-secondary';
    }

    return 'bg-dark';
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-primary">All Incident Tickets</h2>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, category, or status"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        <table className="table table-bordered table-striped align-middle">
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
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
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