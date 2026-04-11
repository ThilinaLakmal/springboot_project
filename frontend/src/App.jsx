import { useState } from 'react';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketListPage from './pages/TicketListPage';
import TicketDetailsPage from './pages/TicketDetailsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('create');

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

      {currentPage === 'create' && <CreateTicketPage />}
      {currentPage === 'list' && <TicketListPage />}
      {currentPage === 'details' && <TicketDetailsPage />}
    </div>
  );
}

export default App;