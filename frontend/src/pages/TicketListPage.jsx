import { useState } from 'react';

function TicketListPage({ tickets, onViewDetails }) {
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('ID_ASC');

  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const statusOrder = {
    OPEN: 1,
    IN_PROGRESS: 2,
    RESOLVED: 3,
    CLOSED: 4,
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchValue = searchText.toLowerCase();

    const matchesSearch =
      ticket.title.toLowerCase().includes(searchValue) ||
      ticket.category.toLowerCase().includes(searchValue) ||
      ticket.status.toLowerCase().includes(searchValue) ||
      ticket.createdAt.toLowerCase().includes(searchValue);

    const matchesPriority =
      priorityFilter === 'All' || ticket.priority === priorityFilter;

    const matchesStatus =
      statusFilter === 'All' || ticket.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'ID_ASC') {
      return a.id - b.id;
    }

    if (sortBy === 'ID_DESC') {
      return b.id - a.id;
    }

    if (sortBy === 'PRIORITY_HIGH_LOW') {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    if (sortBy === 'PRIORITY_LOW_HIGH') {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    if (sortBy === 'STATUS_ASC') {
      return statusOrder[a.status] - statusOrder[b.status];
    }

    if (sortBy === 'STATUS_DESC') {
      return statusOrder[b.status] - statusOrder[a.status];
    }

    if (sortBy === 'CREATED_NEWEST') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortBy === 'CREATED_OLDEST') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    return 0;
  });

  const openCount = sortedTickets.filter((ticket) => ticket.status === 'OPEN').length;
  const inProgressCount = sortedTickets.filter(
    (ticket) => ticket.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = sortedTickets.filter(
    (ticket) => ticket.status === 'RESOLVED'
  ).length;
  const closedCount = sortedTickets.filter((ticket) => ticket.status === 'CLOSED').length;

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

  const handleClearFilters = () => {
    setSearchText('');
    setPriorityFilter('All');
    setStatusFilter('All');
    setSortBy('ID_ASC');
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 className="text-primary mb-0">All Incident Tickets</h2>

          <button
            className="btn btn-outline-secondary"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, category, status, or created time"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="col-md-2">
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

          <div className="col-md-2">
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

          <div className="col-md-4">
            <select
              className="form-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="ID_ASC">Sort by ID: Low to High</option>
              <option value="ID_DESC">Sort by ID: High to Low</option>
              <option value="PRIORITY_HIGH_LOW">Sort by Priority: High to Low</option>
              <option value="PRIORITY_LOW_HIGH">Sort by Priority: Low to High</option>
              <option value="STATUS_ASC">Sort by Status: OPEN to CLOSED</option>
              <option value="STATUS_DESC">Sort by Status: CLOSED to OPEN</option>
              <option value="CREATED_NEWEST">Sort by Created Time: Newest First</option>
              <option value="CREATED_OLDEST">Sort by Created Time: Oldest First</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <div className="alert alert-light border mb-0">
            Showing <strong>{sortedTickets.length}</strong> result(s) out of{' '}
            <strong>{tickets.length}</strong> total ticket(s).
          </div>
        </div>

        <div className="row g-2 mb-4">
          <div className="col-md-3">
            <div className="border rounded p-3 text-center">
              <span className="badge bg-primary mb-2">OPEN</span>
              <div className="fw-bold fs-5">{openCount}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded p-3 text-center">
              <span className="badge bg-warning text-dark mb-2">IN_PROGRESS</span>
              <div className="fw-bold fs-5">{inProgressCount}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded p-3 text-center">
              <span className="badge bg-success mb-2">RESOLVED</span>
              <div className="fw-bold fs-5">{resolvedCount}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="border rounded p-3 text-center">
              <span className="badge bg-secondary mb-2">CLOSED</span>
              <div className="fw-bold fs-5">{closedCount}</div>
            </div>
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
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.length > 0 ? (
              sortedTickets.map((ticket) => (
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
                  <td>{ticket.createdAt}</td>
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
                <td colSpan="7" className="text-center">
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