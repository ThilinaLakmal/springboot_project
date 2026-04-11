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
    },
  ]);

  const addNewTicket = (newTicket) => {
    const ticketWithId = {
      ...newTicket,
      id: tickets.length + 1,
      status: 'OPEN',
      assignedTechnician: 'Not Assigned',
      resolutionNote: 'No resolution yet',
    };

    setTickets([...tickets, ticketWithId]);
    setCurrentPage('list');
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setCurrentPage('details');
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

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand mb-0 h1">Incident Management System</span>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => setCurrentPage('create')}
          >
            Create Ticket
          </button>

          <button
            className="btn btn-warning me-2"
            onClick={() => setCurrentPage('list')}
          >
            View Tickets
          </button>

          <button
            className="btn btn-info"
            onClick={() => setCurrentPage('details')}
          >
            Ticket Details
          </button>
        </div>
      </nav>

      {currentPage === 'create' && <CreateTicketPage onAddTicket={addNewTicket} />}

      {currentPage === 'list' && (
        <TicketListPage tickets={tickets} onViewDetails={handleViewDetails} />
      )}

      {currentPage === 'details' && (
        <TicketDetailsPage
  ticket={selectedTicket}
  onUpdateStatus={handleUpdateStatus}
/>
      )}
    </div>
  );
}

export default App;