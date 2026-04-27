import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Ticket,
  UserCog,
  Wrench,
  XCircle,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081/api/tickets';

const defaultForm = {
  title: '',
  category: 'Network',
  priority: 'Medium',
  contactDetails: '',
  description: '',
  attachmentFileName: '',
};

const categoryOptions = ['Network', 'Hardware', 'Software', 'Account', 'Security', 'Other'];
const priorityOptions = ['High', 'Medium', 'Low'];
const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const normalizeTicket = (ticket) => ({
  ...ticket,
  title: ticket?.title || 'Untitled ticket',
  category: ticket?.category || 'Other',
  priority: ticket?.priority || 'Medium',
  status: ticket?.status || 'OPEN',
  contactDetails: ticket?.contactDetails || 'Not provided',
  description: ticket?.description || 'No description provided',
  createdAt: ticket?.createdAt || '',
  assignedTechnician: ticket?.assignedTechnician || 'Not Assigned',
  resolutionNote: ticket?.resolutionNote || 'No resolution yet',
  comments: Array.isArray(ticket?.comments) ? ticket.comments : [],
  attachments: Array.isArray(ticket?.attachments) ? ticket.attachments : [],
});

const formatDateTime = (value) => {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const priorityBadgeClass = (priority) => {
  if (priority === 'High') return 'bg-red-50 text-red-700 ring-red-600/20';
  if (priority === 'Medium') return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
};

const statusBadgeClass = (status) => {
  if (status === 'OPEN') return 'bg-blue-50 text-blue-700 ring-blue-600/20';
  if (status === 'IN_PROGRESS') return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  if (status === 'RESOLVED') return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
  if (status === 'CLOSED') return 'bg-slate-100 text-slate-700 ring-slate-600/20';
  return 'bg-slate-100 text-slate-700 ring-slate-600/20';
};

const StatCard = ({ label, value, icon: Icon, helper, tone = 'blue' }) => {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    red: 'bg-red-50 text-red-600 ring-red-100',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <div className={`p-3 rounded-2xl ring-1 ${toneMap[tone] || toneMap.blue}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${className}`}>
    {children}
  </span>
);

const EmptyState = ({ onCreate }) => (
  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
    <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
      <Ticket size={26} />
    </div>
    <h3 className="mt-4 text-lg font-bold text-slate-900">No incident tickets found</h3>
    <p className="mt-1 text-sm text-slate-500">Create a new incident ticket to start tracking support issues.</p>
    <button
      type="button"
      onClick={onCreate}
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
    >
      <Plus size={16} />
      Create Ticket
    </button>
  </div>
);

function TicketModule() {
  const [currentTab, setCurrentTab] = useState('list');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [formData, setFormData] = useState(defaultForm);
  const [technicianName, setTechnicianName] = useState('');
  const [statusData, setStatusData] = useState({ status: 'OPEN', resolutionNote: '' });
  const [commentText, setCommentText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const fetchAllTickets = async () => {
    setLoading(true);

    try {
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error('Failed to load tickets');
      }

      const data = await response.json();
      setTickets(data.map(normalizeTicket));
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load incident tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketById = async (ticketId) => {
    const response = await fetch(`${API_BASE_URL}/${ticketId}`);

    if (!response.ok) {
      throw new Error('Failed to load ticket details');
    }

    return normalizeTicket(await response.json());
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      setTechnicianName(selectedTicket.assignedTechnician === 'Not Assigned' ? '' : selectedTicket.assignedTechnician);
      setStatusData({
        status: selectedTicket.status || 'OPEN',
        resolutionNote: selectedTicket.resolutionNote === 'No resolution yet' ? '' : selectedTicket.resolutionNote,
      });
    }
  }, [selectedTicket]);

  const stats = useMemo(() => {
    const open = tickets.filter((ticket) => ticket.status === 'OPEN').length;
    const inProgress = tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((ticket) => ticket.status === 'RESOLVED').length;
    const closed = tickets.filter((ticket) => ticket.status === 'CLOSED').length;

    return { total: tickets.length, open, inProgress, resolved, closed };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const filtered = tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.category.toLowerCase().includes(query) ||
        ticket.status.toLowerCase().includes(query) ||
        ticket.priority.toLowerCase().includes(query) ||
        ticket.contactDetails.toLowerCase().includes(query);

      const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime() || 0;
      const dateB = new Date(b.createdAt).getTime() || 0;
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const statusOrder = { OPEN: 1, IN_PROGRESS: 2, RESOLVED: 3, CLOSED: 4 };

      if (sortBy === 'OLDEST') return dateA - dateB;
      if (sortBy === 'PRIORITY') return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (sortBy === 'STATUS') return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      if (sortBy === 'ID_ASC') return (a.id || 0) - (b.id || 0);
      if (sortBy === 'ID_DESC') return (b.id || 0) - (a.id || 0);
      return dateB - dateA;
    });
  }, [tickets, searchText, priorityFilter, statusFilter, sortBy]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.contactDetails.trim()) {
      toast.error('Please fill title, description and contact details');
      return;
    }

    const requestBody = {
      title: formData.title.trim(),
      category: formData.category,
      priority: formData.priority,
      contactDetails: formData.contactDetails.trim(),
      description: formData.description.trim(),
      attachments: formData.attachmentFileName.trim() ? [formData.attachmentFileName.trim()] : [],
    };

    setSubmitting(true);

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const savedTicket = normalizeTicket(await response.json());
      setSelectedTicket(savedTicket);
      setFormData(defaultForm);
      await fetchAllTickets();
      setCurrentTab('details');
      toast.success('Incident ticket created successfully');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (ticket) => {
    try {
      const freshTicket = await fetchTicketById(ticket.id);
      setSelectedTicket(freshTicket);
      setCurrentTab('details');
    } catch (error) {
      console.error('Error loading ticket details:', error);
      toast.error('Failed to load ticket details');
    }
  };

  const handleUpdateStatus = async (event) => {
    event.preventDefault();

    if (!selectedTicket) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusData.status,
          resolutionNote: statusData.resolutionNote.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedTicket = normalizeTicket(await response.json());
      setSelectedTicket(updatedTicket);
      await fetchAllTickets();
      toast.success('Ticket status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleAssignTechnician = async (event) => {
    event.preventDefault();

    if (!selectedTicket) return;

    if (!technicianName.trim()) {
      toast.error('Please enter technician name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedTicket.id}/assign-technician`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTechnician: technicianName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to assign technician');

      const updatedTicket = normalizeTicket(await response.json());
      setSelectedTicket(updatedTicket);
      await fetchAllTickets();
      toast.success('Technician assigned');
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast.error('Failed to assign technician');
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!selectedTicket) return;

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentText.trim() }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const updatedTicket = normalizeTicket(await response.json());
      setSelectedTicket(updatedTicket);
      setCommentText('');
      await fetchAllTickets();
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentIndex) => {
    if (!selectedTicket) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedTicket.id}/comments/${commentIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      const updatedTicket = normalizeTicket(await response.json());
      setSelectedTicket(updatedTicket);
      await fetchAllTickets();
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleAddAttachment = async (event) => {
    event.preventDefault();

    if (!selectedTicket) return;

    if (!attachmentName.trim()) {
      toast.error('Please enter an attachment file name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedTicket.id}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentFileName: attachmentName.trim() }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to add attachment');
      }

      const updatedTicket = normalizeTicket(await response.json());
      setSelectedTicket(updatedTicket);
      setAttachmentName('');
      await fetchAllTickets();
      toast.success('Attachment added');
    } catch (error) {
      console.error('Error adding attachment:', error);
      toast.error(error.message || 'Failed to add attachment');
    }
  };

  const handleDeleteAttachment = async (attachmentNameToDelete) => {
    if (!selectedTicket) return;

    const attachmentIndex = selectedTicket.attachments.findIndex((attachment) => attachment === attachmentNameToDelete);

    if (attachmentIndex === -1) {
      toast.error('Attachment not found');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedTicket.id}/attachments/${attachmentIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete attachment');

      const updatedTicket = normalizeTicket(await response.json());
      setSelectedTicket(updatedTicket);
      await fetchAllTickets();
      toast.success('Attachment removed');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to remove attachment');
    }
  };

  const tabButtonClass = (tabName) =>
    currentTab === tabName
      ? 'bg-blue-600 text-white shadow-sm'
      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 ring-1 ring-white/10">
              <ShieldAlert size={14} />
              Member 3 Module
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">Incident Ticket Management</h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300">
              Track campus IT incidents, assign technicians, update resolutions and maintain support communication in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCurrentTab('create')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={17} />
              Create Ticket
            </button>
            <button
              type="button"
              onClick={fetchAllTickets}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/15 hover:bg-white/15 transition-colors"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="Total Tickets" value={stats.total} icon={Ticket} helper="All incidents" tone="slate" />
        <StatCard label="Open" value={stats.open} icon={AlertCircle} helper="Waiting for action" tone="blue" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock3} helper="Technician assigned" tone="amber" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} helper="Issue solved" tone="emerald" />
        <StatCard label="Closed" value={stats.closed} icon={XCircle} helper="Archived tickets" tone="red" />
      </section>

      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setCurrentTab('list')} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${tabButtonClass('list')}`}>
            Ticket Queue
          </button>
          <button type="button" onClick={() => setCurrentTab('create')} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${tabButtonClass('create')}`}>
            Create Ticket
          </button>
          <button type="button" onClick={() => setCurrentTab('details')} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${tabButtonClass('details')}`}>
            Ticket Details
          </button>
        </div>
        <p className="text-xs font-semibold text-slate-500">
          API connected to <span className="text-slate-800">localhost:8081/api/tickets</span>
        </p>
      </section>

      {currentTab === 'create' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCreateTicket} className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Create New Incident</h2>
                <p className="text-sm text-slate-500 mt-1">Submit a support request with priority and contact details.</p>
              </div>
              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <FileText size={24} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Ticket Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Example: Wi-Fi not working in lecture hall"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Contact Details</label>
                <input
                  type="text"
                  name="contactDetails"
                  value={formData.contactDetails}
                  onChange={handleFormChange}
                  placeholder="Email / phone / location"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="5"
                  placeholder="Describe the incident, affected area and urgency..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Attachment File Name</label>
                <input
                  type="text"
                  name="attachmentFileName"
                  value={formData.attachmentFileName}
                  onChange={handleFormChange}
                  placeholder="Optional: screenshot.png"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                <Send size={17} />
                {submitting ? 'Creating...' : 'Submit Ticket'}
              </button>
              <button
                type="button"
                onClick={() => setFormData(defaultForm)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Clear Form
              </button>
            </div>
          </form>

          <aside className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 h-fit">
            <h3 className="text-lg font-black text-slate-900">Ticket Preview</h3>
            <p className="mt-1 text-sm text-slate-500">This preview helps the module look consistent before saving.</p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge className={priorityBadgeClass(formData.priority)}>{formData.priority}</Badge>
                <Badge className={statusBadgeClass('OPEN')}>OPEN</Badge>
              </div>
              <h4 className="text-base font-bold text-slate-900">{formData.title || 'Ticket title preview'}</h4>
              <p className="text-sm text-slate-600 line-clamp-4">{formData.description || 'Incident description preview will appear here.'}</p>
              <div className="pt-3 border-t border-slate-200 text-xs font-semibold text-slate-500">
                Category: <span className="text-slate-800">{formData.category}</span>
              </div>
            </div>
          </aside>
        </section>
      )}

      {currentTab === 'list' && (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Incident Ticket Queue</h2>
                <p className="text-sm text-slate-500 mt-1">Showing {filteredTickets.length} of {tickets.length} ticket(s).</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchText('');
                  setPriorityFilter('All');
                  setStatusFilter('All');
                  setSortBy('NEWEST');
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="relative xl:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search tickets..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="All">All Priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="All">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="PRIORITY">Priority High to Low</option>
                <option value="STATUS">Status Order</option>
                <option value="ID_ASC">ID Low to High</option>
                <option value="ID_DESC">ID High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 font-semibold">Loading tickets from backend...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-6">
              <EmptyState onCreate={() => setCurrentTab('create')} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Ticket</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100">
                            <Ticket size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{ticket.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">#{ticket.id} • {ticket.contactDetails}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{ticket.category}</td>
                      <td className="px-6 py-4"><Badge className={priorityBadgeClass(ticket.priority)}>{ticket.priority}</Badge></td>
                      <td className="px-6 py-4"><Badge className={statusBadgeClass(ticket.status)}>{ticket.status}</Badge></td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(ticket.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(ticket)}
                          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {currentTab === 'details' && (
        <section>
          {!selectedTicket ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 ring-1 ring-blue-100">
                <Ticket size={26} />
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-900">Select a ticket to view details</h2>
              <p className="mt-1 text-sm text-slate-500">Open the ticket queue and choose a ticket for status updates, comments and attachments.</p>
              <button
                type="button"
                onClick={() => setCurrentTab('list')}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
              >
                Go to Ticket Queue
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={priorityBadgeClass(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                      <Badge className={statusBadgeClass(selectedTicket.status)}>{selectedTicket.status}</Badge>
                      <span className="text-xs font-bold text-slate-500">Ticket #{selectedTicket.id}</span>
                    </div>
                    <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">{selectedTicket.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">Created {formatDateTime(selectedTicket.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('list')}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Back to List
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                    >
                      <Printer size={16} />
                      Print
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</p>
                    <p className="mt-1 font-bold text-slate-900">{selectedTicket.category}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact</p>
                    <p className="mt-1 font-bold text-slate-900 break-words">{selectedTicket.contactDetails}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Technician</p>
                    <p className="mt-1 font-bold text-slate-900">{selectedTicket.assignedTechnician}</p>
                  </div>
                  <div className="lg:col-span-3 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Issue Description</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">{selectedTicket.description}</p>
                  </div>
                  <div className="lg:col-span-3 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Resolution Note</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 whitespace-pre-line">{selectedTicket.resolutionNote || 'No resolution yet'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <form onSubmit={handleUpdateStatus} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100">
                      <Wrench size={19} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">Update Status</h3>
                      <p className="text-sm text-slate-500">Change current progress and resolution note.</p>
                    </div>
                  </div>

                  <select
                    value={statusData.status}
                    onChange={(event) => setStatusData((previous) => ({ ...previous, status: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  <textarea
                    value={statusData.resolutionNote}
                    onChange={(event) => setStatusData((previous) => ({ ...previous, resolutionNote: event.target.value }))}
                    rows="4"
                    placeholder="Add resolution note or progress update..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                    Save Status
                  </button>
                </form>

                <form onSubmit={handleAssignTechnician} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100">
                      <UserCog size={19} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">Assign Technician</h3>
                      <p className="text-sm text-slate-500">Add the technician responsible for this incident.</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={technicianName}
                    onChange={(event) => setTechnicianName(event.target.value)}
                    placeholder="Technician name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                    Assign Technician
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-100">
                      <MessageSquare size={19} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">Comments</h3>
                      <p className="text-sm text-slate-500">{selectedTicket.comments.length} comment(s)</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                      Add
                    </button>
                  </form>

                  <div className="space-y-3">
                    {selectedTicket.comments.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">No comments added yet.</p>
                    ) : (
                      selectedTicket.comments.map((comment, index) => (
                        <div key={`${comment}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-3">
                          <p className="text-sm text-slate-700">{comment}</p>
                          <button type="button" onClick={() => handleDeleteComment(index)} className="text-xs font-bold text-red-600 hover:text-red-700">
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-100">
                      <Paperclip size={19} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">Attachments</h3>
                      <p className="text-sm text-slate-500">{selectedTicket.attachments.length} file(s)</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddAttachment} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={attachmentName}
                      onChange={(event) => setAttachmentName(event.target.value)}
                      placeholder="Example: error-screenshot.png"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                    <button type="submit" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                      Add
                    </button>
                  </form>

                  <div className="space-y-3">
                    {selectedTicket.attachments.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">No attachments added yet.</p>
                    ) : (
                      selectedTicket.attachments.map((attachment, index) => (
                        <div key={`${attachment}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Paperclip size={16} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-semibold text-slate-700 truncate">{attachment}</span>
                          </div>
                          <button type="button" onClick={() => handleDeleteAttachment(attachment)} className="text-xs font-bold text-red-600 hover:text-red-700">
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default TicketModule;
