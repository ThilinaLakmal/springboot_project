import { useState } from 'react';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketListPage from './pages/TicketListPage';
import TicketDetailsPage from './pages/TicketDetailsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('create');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'WiFi not working',
      category: 'Network',
      description: 'The WiFi connection in Lab 2 is not working properly.',
      priority: 'High',
      contactDetails: 'thilini@example.com',
      status: 'OPEN',
      assignedTechnician: 'Not Assigned',
      resolutionNote: 'No resolution yet',
      comments: [
        {
          id: 1,
          user: 'thilini',
          message: 'Please check this issue soon.',
        },
        {
          id: 2,
          user: 'Technician',
          message: 'I am reviewing the issue now.',
        },
      ],
      attachments: ['wifi_issue_1.jpg', 'wifi_issue_2.jpg'],
    },
    {
      id: 2,
      title: 'Projector issue',
      category: 'Hardware',
      description: 'The classroom projector is not turning on.',
      priority: 'Medium',
      contactDetails: 'thilini@example.com',
      status: 'IN_PROGRESS',
      assignedTechnician: 'Thilin Abeykoon',
      resolutionNote: 'Checking power cable',
      comments: [
        {
          id: 1,
          user: 'Technician',
          message: 'I am checking the projector now.',
        },
      ],
      attachments: ['projector_photo.jpg'],
    },
  ]);

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

  const addNewTicket = (newTicket) => {
    const ticketWithId = {
      ...newTicket,
      id: tickets.length + 1,
      status: 'OPEN',
      assignedTechnician: 'Not Assigned',
      resolutionNote: 'No resolution yet',
      comments: [],
      attachments: [],
    };

    setTickets([...tickets, ticketWithId]);
    setCurrentPage('list');
  };

  const handleUpdateStatus = (ticketId, newStatus, newResolutionNote) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status: newStatus,
            resolutionNote: newResolutionNote,
          }
        : ticket
    );

    setTickets(updatedTickets);

    const updatedSelectedTicket = updatedTickets.find(
      (ticket) => ticket.id === ticketId
    );

    setSelectedTicket(updatedSelectedTicket);
  };

  const handleAssignTechnician = (ticketId, technicianName) => {
    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            assignedTechnician: technicianName,
          }
        : ticket
    );

    setTickets(updatedTickets);

    const updatedSelectedTicket = updatedTickets.find(
      (ticket) => ticket.id === ticketId
    );

    setSelectedTicket(updatedSelectedTicket);
  };

  const handleAddComment = (ticketId, commentText) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        const newComment = {
          id: ticket.comments.length + 1,
          user: 'thilini',
          message: commentText,
        };

        return {
          ...ticket,
          comments: [...ticket.comments, newComment],
        };
      }

      return ticket;
    });

    setTickets(updatedTickets);

    const updatedSelectedTicket = updatedTickets.find(
      (ticket) => ticket.id === ticketId
    );

    setSelectedTicket(updatedSelectedTicket);
  };

  const handleDeleteComment = (ticketId, commentId) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          comments: ticket.comments.filter((comment) => comment.id !== commentId),
        };
      }

      return ticket;
    });

    setTickets(updatedTickets);

    const updatedSelectedTicket = updatedTickets.find(
      (ticket) => ticket.id === ticketId
    );

    setSelectedTicket(updatedSelectedTicket);
  };

  const handleAddAttachment = (ticketId, fileName) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        if (ticket.attachments.length >= 3) {
          alert('Maximum 3 attachments allowed.');
          return ticket;
        }

        return {
          ...ticket,
          attachments: [...ticket.attachments, fileName],
        };
      }

      return ticket;
    });

    setTickets(updatedTickets);

    const updatedSelectedTicket = updatedTickets.find(
      (ticket) => ticket.id === ticketId
    );

    setSelectedTicket(updatedSelectedTicket);
  };

  const handleDeleteAttachment = (ticketId, fileName) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          attachments: ticket.attachments.filter((file) => file !== fileName),
        };
      }

      return ticket;
    });

    setTickets(updatedTickets);

    const updatedSelectedTicket = updatedTickets.find(
      (ticket) => ticket.id === ticketId
    );

    setSelectedTicket(updatedSelectedTicket);
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setCurrentPage('details');
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark px-3 py-3">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Incident Management System</span>

          <div className="d-flex flex-wrap gap-2">
            <button
              className={getNavButtonClass('create', 'btn btn-primary')}
              onClick={() => setCurrentPage('create')}
            >
              Create Ticket
            </button>

            <button
              className={getNavButtonClass('list', 'btn btn-warning')}
              onClick={() => setCurrentPage('list')}
            >
              View Tickets
            </button>

            <button
              className={getNavButtonClass('details', 'btn btn-info')}
              onClick={() => setCurrentPage('details')}
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

      {currentPage === 'create' && (
        <CreateTicketPage onAddTicket={addNewTicket} />
      )}

      {currentPage === 'list' && (
        <TicketListPage tickets={tickets} onViewDetails={handleViewDetails} />
      )}

      {currentPage === 'details' && (
        <TicketDetailsPage
          ticket={selectedTicket}
          onUpdateStatus={handleUpdateStatus}
          onAssignTechnician={handleAssignTechnician}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onAddAttachment={handleAddAttachment}
          onDeleteAttachment={handleDeleteAttachment}
        />
      )}
    </div>
  );
}

export default App;