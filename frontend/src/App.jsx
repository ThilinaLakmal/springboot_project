import { useState } from 'react';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketListPage from './pages/TicketListPage';

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
            className="btn btn-warning"
            onClick={() => setCurrentPage('list')}
          >
            View Tickets
          </button>
        </div>
      </nav>

      {currentPage === 'create' && <CreateTicketPage />}
      {currentPage === 'list' && <TicketListPage />}
    </div>
  );
}

export default App;