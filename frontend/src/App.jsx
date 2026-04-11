import { useEffect, useState } from 'react';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketListPage from './pages/TicketListPage';
import TicketDetailsPage from './pages/TicketDetailsPage';

const API_BASE_URL = 'http://localhost:8080/api/tickets';

function App() {
  const [currentPage, setCurrentPage] = useState('create');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicketNotice, setShowNewTicketNotice] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeTicket = (ticket) => ({
    ...ticket,
    comments: Array.isArray(ticket.comments) ? ticket.comments : [],
    attachments: Array.isArray(ticket.attachments) ? ticket.attachments : [],
  });

  const fetchAllTickets = async () => {
    setLoading(true);

    try {
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error('Failed to load tickets');
      }

      const data = await response.json();
      const normalizedTickets = data.map(normalizeTicket);
      setTickets(normalizedTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      alert('Failed to load tickets from backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketById = async (ticketId) => {
    const response = await fetch(`${API_BASE_URL}/${ticketId}`);

    if (!response.ok) {
      throw new Error('Failed to load ticket details');
    }

    const data = await response.json();
    return normalizeTicket(data);
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  const getNavButtonClass = (pageName, defaultClass) => {
    return currentPage === pageName
      ? `${defaultClass} border border-light border-2`
      : defaultClass;
  };

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((ticket) => ticket.status === 'OPEN').length;
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === 'IN_PROGRESS'
  ).length;
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === 'RESOLVED'
  ).length;

  const addNewTicket = async (newTicket) => {
    const { attachmentFileName, ...ticketFields } = newTicket;

    const requestBody = {
      ...ticketFields,
      attachments:
        attachmentFileName.trim() !== '' ? [attachmentFileName.trim()] : [],
    };

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to create ticket');
    }

    const savedTicket = normalizeTicket(await response.json());

    setSelectedTicket(savedTicket);
    setShowNewTicketNotice(true);
    setCurrentPage('details');

    await fetchAllTickets();

    return savedTicket.id;
  };

  const handleUpdateStatus = async (ticketId, newStatus, newResolutionNote) => {
    const response = await fetch(`${API_BASE_URL}/${ticketId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        resolutionNote: newResolutionNote,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    const updatedTicket = normalizeTicket(await response.json());
    setSelectedTicket(updatedTicket);
    await fetchAllTickets();
  };

  const handleAssignTechnician = async (ticketId, technicianName) => {
    const response = await fetch(`${API_BASE_URL}/${ticketId}/assign-technician`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assignedTechnician: technicianName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to assign technician');
    }

    const updatedTicket = normalizeTicket(await response.json());
    setSelectedTicket(updatedTicket);
    await fetchAllTickets();
  };

  const handleAddComment = async (ticketId, commentText) => {
    const response = await fetch(`${API_BASE_URL}/${ticketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: commentText,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    const updatedTicket = normalizeTicket(await response.json());
    setSelectedTicket(updatedTicket);
    await fetchAllTickets();
  };

  const handleDeleteComment = async (ticketId, commentIndex) => {
    const response = await fetch(
      `${API_BASE_URL}/${ticketId}/comments/${commentIndex}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    const updatedTicket = normalizeTicket(await response.json());
    setSelectedTicket(updatedTicket);
    await fetchAllTickets();
  };

  const handleAddAttachment = async (ticketId, fileName) => {
    const response = await fetch(`${API_BASE_URL}/${ticketId}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attachmentFileName: fileName,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to add attachment');
    }

    const updatedTicket = normalizeTicket(await response.json());
    setSelectedTicket(updatedTicket);
    await fetchAllTickets();
  };

  const handleDeleteAttachment = async (ticketId, fileName) => {
    const ticket = tickets.find((item) => item.id === ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const attachmentIndex = ticket.attachments.findIndex(
      (attachment) => attachment === fileName
    );

    if (attachmentIndex === -1) {
      throw new Error('Attachment not found');
    }

    const response = await fetch(
      `${API_BASE_URL}/${ticketId}/attachments/${attachmentIndex}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete attachment');
    }

    const updatedTicket = normalizeTicket(await response.json());
    setSelectedTicket(updatedTicket);
    await fetchAllTickets();
  };

  const handleViewDetails = async (ticket) => {
    try {
      const freshTicket = await fetchTicketById(ticket.id);
      setSelectedTicket(freshTicket);
      setShowNewTicketNotice(false);
      setCurrentPage('details');
    } catch (error) {
      console.error('Error loading ticket details:', error);
      alert('Failed to load ticket details.');
    }
  };

  const handleBackToList = () => {
    setShowNewTicketNotice(false);
    setCurrentPage('list');
  };

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-dark bg-dark px-3 py-3">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Incident Management System</span>

          <div className="d-flex flex-wrap gap-2">
            <button
              className={getNavButtonClass('create', 'btn btn-primary')}
              onClick={() => {
                setShowNewTicketNotice(false);
                setCurrentPage('create');
              }}
            >
              Create Ticket
            </button>

            <button
              className={getNavButtonClass('list', 'btn btn-warning')}
              onClick={() => {
                setShowNewTicketNotice(false);
                setCurrentPage('list');
              }}
            >
              View Tickets
            </button>

            <button
              className={getNavButtonClass('details', 'btn btn-info')}
              onClick={() => {
                setShowNewTicketNotice(false);
                setCurrentPage('details');
              }}
            >
              Ticket Details
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h6 className="text-muted">Total Tickets</h6>
                <h2 className="text-dark mb-0">{totalTickets}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h6 className="text-muted">Open Tickets</h6>
                <h2 className="text-primary mb-0">{openTickets}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h6 className="text-muted">In Progress</h6>
                <h2 className="text-warning mb-0">{inProgressTickets}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow border-0 text-center h-100">
              <div className="card-body">
                <h6 className="text-muted">Resolved Tickets</h6>
                <h2 className="text-success mb-0">{resolvedTickets}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="container mt-4">
          <div className="alert alert-info">Loading tickets from backend...</div>
        </div>
      )}

      {!loading && currentPage === 'create' && (
        <CreateTicketPage onAddTicket={addNewTicket} />
      )}

      {!loading && currentPage === 'list' && (
        <TicketListPage tickets={tickets} onViewDetails={handleViewDetails} />
      )}

      {!loading && currentPage === 'details' && (
        <TicketDetailsPage
          ticket={selectedTicket}
          showNewTicketNotice={showNewTicketNotice}
          onBackToList={handleBackToList}
          onUpdateStatus={handleUpdateStatus}
          onAssignTechnician={handleAssignTechnician}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onAddAttachment={handleAddAttachment}
          onDeleteAttachment={handleDeleteAttachment}
        />
      )}

      <footer className="mt-5 py-4 bg-dark text-white">
        <div className="container text-center">
          <small>
            Incident Management System • Member 3 Frontend Demo • Built with React and Bootstrap
          </small>
        </div>
      </footer>
    </div>
  );
}

export default App;