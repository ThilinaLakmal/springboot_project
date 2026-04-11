import TechnicianAssign from '../components/TechnicianAssign';
import StatusUpdate from '../components/StatusUpdate';
import AttachmentUpload from '../components/AttachmentUpload';
import CommentsSection from '../components/CommentsSection';
function TicketDetailsPage() {
  const ticket = {
    id: 1,
    title: "WiFi not working",
    category: "Network",
    description: "The WiFi connection in Lab 2 is not working properly.",
    priority: "High",
    contactDetails: "thilini@example.com",
    status: "OPEN",
    assignedTechnician: "Not Assigned",
    resolutionNote: "No resolution yet"
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h2 className="mb-4 text-primary">Ticket Details</h2>

        <p><strong>ID:</strong> {ticket.id}</p>
        <p><strong>Title:</strong> {ticket.title}</p>
        <p><strong>Category:</strong> {ticket.category}</p>
        <p><strong>Description:</strong> {ticket.description}</p>
        <p><strong>Priority:</strong> {ticket.priority}</p>
        <p><strong>Contact Details:</strong> {ticket.contactDetails}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
        <p><strong>Assigned Technician:</strong> {ticket.assignedTechnician}</p>
        <p><strong>Resolution Note:</strong> {ticket.resolutionNote}</p>
      </div>

      <CommentsSection />
      <AttachmentUpload />
      <StatusUpdate />
      <TechnicianAssign />
    </div>
  );
}

export default TicketDetailsPage;