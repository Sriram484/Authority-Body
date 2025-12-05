// src/components/CertificateRequests.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Download,
  X,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { exportToCSV } from "../utils/exportCSV";
import {
  acceptCertificateRequest,
  CertificateRequestDoc,
  getCertificateRequests,
  updateCertificateRequestStatus,
} from "../firebase/certificate-services";
import {
  dataUrlToBlob,
  normalizeToDataUrl,
} from "../utils/attachmentConverters";
import { fetchAttachmentDocById } from "../firebase/attachment-service";
import { useAuth } from "../context/AuthContext";

const itemsPerPageDefault = 10;

export default function CertificateRequests() {
  const [requests, setRequests] = useState<CertificateRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] =
    useState<CertificateRequestDoc | null>(null);
  const [remarks, setRemarks] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = itemsPerPageDefault;
  const { abId } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getCertificateRequests({ authorityBodyId: abId ?? undefined });
        setRequests(data);
        setError(null);
      } catch (err: any) {
        console.error("load requests failed", err);
        setError(err?.message ?? "Failed to load requests");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (r.studentName ?? "").toString().toLowerCase().includes(q) ||
      (r.courseTitle ?? "").toString().toLowerCase().includes(q) ||
      (r.agencyName ?? "").toString().toLowerCase().includes(q) ||
      (r.studentEmail ?? "").toString().toLowerCase().includes(q) ||
      (r.studentId ?? "").toString().toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "All" ||
      (r.status ?? "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleExport = () => {
    const exportData = filteredRequests.map((r) => ({
      ID: r.id,
      StudentName: r.studentName,
      StudentID: r.studentId,
      Email: r.studentEmail,
      Course: r.courseTitle,
      CourseID: r.courseId,
      Agency: r.agencyName,
      AgencyUserId: r.agencyUserId,
      Status: r.status,
    }));
    exportToCSV(exportData, "certificate-requests");
  };

  const openModal = (req: CertificateRequestDoc) => {
    setSelectedRequest(req);
    setRemarks(req.rejectionComments ?? "");
  };
  const closeModal = () => {
    setSelectedRequest(null);
    setRemarks("");
  };

  const handleViewDocument = async (docRef: {
    id: string;
    name?: string;
    type?: string;
    size?: number;
  }) => {
    if (!docRef?.id) {
      alert("Document ID missing.");
      return;
    }

    try {
      const attach = await fetchAttachmentDocById(docRef.id);
      if (!attach) {
        alert("Attachment not found.");
        return;
      }

      // Prefer stored dataUrl, else generate from raw base64
      const dataUrl =
        attach.dataUrl ||
        (attach.base64
          ? normalizeToDataUrl(
              attach.base64,
              attach.mimeType ?? docRef.type ?? "application/pdf"
            )
          : null);

      if (!dataUrl) {
        alert("No file data available.");
        return;
      }

      const blob = dataUrlToBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Failed to load attachment:", err);
      alert("Failed to load attachment.");
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      const reviewerName = abId ? `AB-${abId}` : "Authority Reviewer";
      const reviewedAt = new Date().toISOString();
      const studentId = selectedRequest.studentId ?? "";
      const { acceptedId } = await acceptCertificateRequest({
        requestId: selectedRequest.id,
        reviewerName,
        reviewedAt,
        studentId,
      });

      console.log("Moved to AcceptedCertificates id:", acceptedId);

      const data = await getCertificateRequests({ authorityBodyId: abId ?? undefined });
      setRequests(data);
      closeModal();
    } catch (err: any) {
      console.error("approve failed", err);
      alert("Failed to approve: " + (err?.message || err));
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!remarks.trim()) {
      alert("Please provide remarks before rejecting");
      return;
    }
    try {
      await updateCertificateRequestStatus(selectedRequest.id, {
        status: "rejected",
        rejectionComments: remarks,
        reviewedAt: new Date().toISOString(),
      });
      const data = await getCertificateRequests({ authorityBodyId: abId ?? undefined });
      setRequests(data);
      closeModal();
    } catch (err: any) {
      console.error("reject failed", err);
      alert("Failed to reject: " + (err?.message || err));
    }
  };

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            <span>Withdrawn</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (loading)
    return <p className="p-6 text-gray-700">Loading certificate requests…</p>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Certificate Requests</h1>
        <button
          onClick={handleExport}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student, course, agency or ID..."
              className="w-full pl-11 pr-4 py-3 border rounded-lg"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-11 pr-8 py-3 border rounded-lg bg-white min-w-[160px]"
            >
              <option>All</option>
              <option>pending</option>
              <option>approved</option>
              <option>rejected</option>
              <option>withdrawn</option>
            </select>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Student</th>
                <th className="text-left py-3 px-4">Course</th>
                <th className="text-left py-3 px-4">Agency</th>
                <th className="text-left py-3 px-4">Submitted</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  {/* STUDENT: show name + ID (and email) */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium">
                        {r.studentName || "Unknown student"}
                      </div>
                      <div className="text-xs font-mono text-gray-500">
                        ID: {r.studentId || "—"}
                      </div>
                      {r.studentEmail && (
                        <div className="text-xs text-gray-500">
                          {r.studentEmail}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* COURSE: course name only in table */}
                  <td className="py-4 px-4">
                    {r.courseTitle || "—"}
                  </td>

                  {/* AGENCY: agency name only in table */}
                  <td className="py-4 px-4">
                    {r.agencyName || "—"}
                  </td>

                  {/* SUBMITTED DATE */}
                  <td className="py-4 px-4">
                    {r.submittedAt
                      ? new Date(
                          // support both Timestamp + ISO string
                          (r.submittedAt as any)?.seconds
                            ? (r.submittedAt as any).toDate()
                            : r.submittedAt
                        )
                          .toISOString()
                          .split("T")[0]
                      : "—"}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4">{getStatusBadge(r.status ?? "")}</td>

                  {/* ACTIONS */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openModal(r)}
                      className="px-3 py-1 rounded bg-blue-50 text-blue-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of{" "}
              {filteredRequests.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl overflow-auto max-h-[90vh]">
            {/* modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <FileText />
                <div>
                  <div className="font-semibold">
                    {selectedRequest.courseTitle || "Certificate Request"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedRequest.studentName || "—"}
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* IDs + Names section */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Request ID</p>
                  <p className="font-mono text-xs break-all">
                    {selectedRequest.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedRequest.status ?? "")}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Student</p>
                  <p className="font-medium">
                    {selectedRequest.studentName || "—"}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    ID: {selectedRequest.studentId || "—"}
                  </p>
                  {selectedRequest.studentEmail && (
                    <p className="text-xs text-gray-500">
                      {selectedRequest.studentEmail}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Course</p>
                  <p className="font-medium">
                    {selectedRequest.courseTitle || "—"}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    ID: {selectedRequest.courseId || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Agency</p>
                  <p className="font-medium">
                    {selectedRequest.agencyName || "—"}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    User ID: {selectedRequest.agencyUserId || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Submitted At</p>
                  <p className="text-sm">
                    {selectedRequest.submittedAt
                      ? new Date(
                          (selectedRequest.submittedAt as any)?.seconds
                            ? (selectedRequest.submittedAt as any).toDate()
                            : selectedRequest.submittedAt
                        )
                          .toISOString()
                          .split("T")[0]
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Justification */}
              <div>
                <label className="text-sm font-medium">Justification</label>
                <p className="mt-1 text-sm">
                  {selectedRequest.rationale || selectedRequest.notes || "—"}
                </p>
              </div>

              {/* Attachments */}
              <div>
                <label className="text-sm font-medium">Attachments</label>
                <div className="space-y-2 mt-2">
                  {(!selectedRequest.attachments ||
                    selectedRequest.attachments.length === 0) && (
                    <p className="text-sm text-gray-500">No attachments</p>
                  )}
                  {selectedRequest.attachments?.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <FileText />
                        <div>
                          <div className="font-medium text-sm">
                            {doc.name || "Attachment"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {doc.type || "file"} •{" "}
                            {(doc.size ?? 0) / 1024 >= 1
                              ? `${((doc.size ?? 0) / 1024).toFixed(1)} KB`
                              : `${doc.size ?? 0} B`}
                          </div>
                        </div>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleViewDocument(doc);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-sm font-medium">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>

              {/* Approve / Reject */}
              {selectedRequest.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 text-white py-2 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-red-600 text-white py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
