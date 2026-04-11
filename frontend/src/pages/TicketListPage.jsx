function TicketListPage() {
  const tickets = [
    {
      id: 1,
      title: "WiFi not working",
      category: "Network",
      priority: "High",
      status: "OPEN",
    },
    {
      id: 2,
      title: "Projector issue",
      category: "Hardware",
      priority: "Medium",
      status: "IN_PROGRESS",
    },
    {
      id: 3,
      title: "Email login problem",
      category: "Software",
      priority: "Low",
      status: "RESOLVED",
    },
  ];

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-primary">All Incident Tickets</h2>

        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>{ticket.category}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketListPage;