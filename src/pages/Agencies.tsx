import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  BookOpen,
} from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';

interface AgenciesProps {
  data: any;
  onAddAgency: (agency: any) => void;
  onUpdateAgency: (id: string, updates: any) => void;
  onDeleteAgency: (id: string) => void;
}

const Agencies: React.FC<AgenciesProps> = ({ data, onAddAgency, onUpdateAgency, onDeleteAgency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    adminEmail: '',
    location: '',
    phone: '',
    website: '',
    coursesOffered: '',
  });

  const filteredAgencies = data.agencies.filter((agency: any) =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredAgencies.map((a: any) => ({
      ID: a.id,
      Name: a.name,
      Email: a.adminEmail,
      Location: a.location,
      Phone: a.phone,
      Website: a.website,
      CoursesOffered: a.coursesOffered.join('; '),
      Status: a.status,
      RegisteredDate: a.registeredDate,
      TotalCertificates: a.totalCertificates,
    }));
    exportToCSV(exportData, 'agencies');
  };

  const openAddModal = () => {
    setEditingAgency(null);
    setFormData({
      name: '',
      adminEmail: '',
      location: '',
      phone: '',
      website: '',
      coursesOffered: '',
    });
    setShowModal(true);
  };

  const openEditModal = (agency: any) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      adminEmail: agency.adminEmail,
      location: agency.location,
      phone: agency.phone,
      website: agency.website,
      coursesOffered: agency.coursesOffered.join(', '),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgency(null);
    setFormData({
      name: '',
      adminEmail: '',
      location: '',
      phone: '',
      website: '',
      coursesOffered: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.adminEmail || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    const agencyData = {
      name: formData.name,
      adminEmail: formData.adminEmail,
      location: formData.location,
      phone: formData.phone,
      website: formData.website,
      coursesOffered: formData.coursesOffered
        .split(',')
        .map(c => c.trim())
        .filter(c => c),
      status: 'Active',
    };

    if (editingAgency) {
      onUpdateAgency(editingAgency.id, agencyData);
    } else {
      const newAgency = {
        id: `ag-${Date.now()}`,
        ...agencyData,
        registeredDate: new Date().toISOString().split('T')[0],
        totalCertificates: 0,
      };
      onAddAgency(newAgency);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this agency?')) {
      onDeleteAgency(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Assessment Agencies</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Agency</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agencies by name, location, or email..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgencies.map((agency: any) => (
            <div
              key={agency.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agency.name}</h3>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {agency.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{agency.adminEmail}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{agency.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{agency.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{agency.website}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">Courses Offered:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agency.coursesOffered.slice(0, 2).map((course: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                    >
                      {course}
                    </span>
                  ))}
                  {agency.coursesOffered.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      +{agency.coursesOffered.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm">
                  <span className="text-gray-600">Total Certificates: </span>
                  <span className="font-semibold text-gray-900">{agency.totalCertificates}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(agency)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agency.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAgencies.length === 0 && (
          <p className="text-center text-gray-500 py-12">No agencies found</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAgency ? 'Edit Agency' : 'Add New Agency'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Excellence Assessment Center"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@agency.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="New York, NY"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1-555-0123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://agency.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courses Offered (comma-separated)
                </label>
                <textarea
                  value={formData.coursesOffered}
                  onChange={(e) => setFormData({ ...formData, coursesOffered: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Course 1, Course 2, Course 3"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingAgency ? 'Update Agency' : 'Add Agency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agencies;
