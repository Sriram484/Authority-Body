import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  X,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { exportToCSV } from '../utils/exportCSV';

interface CertificateRequestsProps {
  data: any;
  onUpdateRequest: (id: string, updates: any) => void;
}

const CertificateRequests: React.FC<CertificateRequestsProps> = ({ data, onUpdateRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRequests = data.certificateRequests.filter((request: any) => {
    const matchesSearch =
      request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    const exportData = filteredRequests.map((r: any) => ({
      ID: r.id,
      Student: r.studentName,
      Email: r.studentEmail,
      StudentID: r.studentId,
      Course: r.courseTitle,
      Agency: r.agencyName,
      Status: r.status,
      SubmittedDate: r.submittedDate,
      ReviewedDate: r.reviewedDate || 'N/A',
      Remarks: r.remarks || 'N/A',
    }));
    exportToCSV(exportData, 'certificate-requests');
  };

  const openModal = (request: any) => {
    setSelectedRequest(request);
    setRemarks(request.remarks || '');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setRemarks('');
  };

  const handleApprove = () => {
    if (selectedRequest) {
      onUpdateRequest(selectedRequest.id, {
        status: 'Approved',
        reviewedDate: new Date().toISOString().split('T')[0],
        remarks,
      });
      closeModal();
    }
  };

  const handleReject = () => {
    if (selectedRequest && remarks.trim()) {
      onUpdateRequest(selectedRequest.id, {
        status: 'Rejected',
        reviewedDate: new Date().toISOString().split('T')[0],
        remarks,
      });
      closeModal();
    } else {
      alert('Please provide remarks before rejecting');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Certificate Requests</h1>
        <button
          onClick={handleExport}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, course, agency, or email..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-11 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-[160px]"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Agency</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Submitted</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((request: any) => (
                <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{request.studentName}</p>
                      <p className="text-xs text-gray-500">{request.studentEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">{request.courseTitle}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{request.agencyName}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{request.submittedDate}</td>
                  <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openModal(request)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRequests.length)} of{' '}
              {filteredRequests.length}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Certificate Request Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Student Name</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Student Email</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.studentEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Student ID</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.studentId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Course</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.courseTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Agency</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.agencyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Submitted Date</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.submittedDate}</p>
                </div>
                {selectedRequest.reviewedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reviewed Date</label>
                    <p className="text-gray-900 mt-1">{selectedRequest.reviewedDate}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Attached Documents
                </label>
                <div className="space-y-2">
                  {selectedRequest.documents.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type}</p>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Remarks {selectedRequest.status === 'Pending' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your review comments here..."
                  rows={4}
                  disabled={selectedRequest.status !== 'Pending'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {selectedRequest.status === 'Pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Approve</span>
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateRequests;
