// src/components/CertificateRequests.tsx
"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { exportToCSV } from "../utils/exportCSV";
import {
  acceptCertificateRequest,
  CertificateRequestDoc,
  fetchAttachmentRecord,
  getCertificateRequests,
  updateCertificateRequestStatus,
} from "../firebase/certificate-services";
import {
  dataUrlToBlob,
  normalizeToDataUrl,
} from "../utils/attachmentConverters";
import { fetchAttachmentDocById } from "../firebase/course-claim-service";
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
        const data = await getCertificateRequests();
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
      (r.studentEmail ?? "").toString().toLowerCase().includes(q);
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
      Student: r.studentName,
      Email: r.studentEmail,
      StudentID: r.studentId,
      Course: r.courseTitle,
      Agency: r.agencyName,
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
          ? normalizeToDataUrl(attach.base64, attach.mimeType ?? docRef.type)
          : null);

      if (!dataUrl) {
        alert("No file data available.");
        return;
      }

      // Convert to Blob
      const blob = dataUrlToBlob(dataUrl);
      const url = URL.createObjectURL(blob);

      // Open in a new tab
      window.open(url, "_blank");

      // Optional: revoke URL after some time
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Failed to load attachment:", err);
      alert("Failed to load attachment.");
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      // optional: pass reviewerName or reviewedAt as needed
      const reviewerName = abId ? `AB-${abId}` : "Authority Reviewer";
      const reviewedAt = new Date().toISOString();
      const studentId = selectedRequest.studentId ?? "";
      const { acceptedId } = await acceptCertificateRequest({
        requestId: selectedRequest.id,
        reviewerName,
        reviewedAt,
        studentId,
      });

      console.log(selectedRequest);

      console.log("Moved to AcceptedCertificates id:", acceptedId);

      // reload requests after deletion from CertificateApprovalRequest
      const data = await getCertificateRequests();
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
      const data = await getCertificateRequests();
      setRequests(data);
      closeModal();
    } catch (err: any) {
      console.error("reject failed", err);
      alert("Failed to reject: " + (err?.message || err));
    }
  };

  /** Convert attachment base64/dataUrl -> Blob and open in new tab */
  async function openAttachmentById(
    attachmentId: string,
    fallbackName?: string
  ) {
    try {
      const rec = await fetchAttachmentRecord(attachmentId);
      if (!rec) {
        alert("Attachment not found");
        return;
      }

      // determine dataUrl
      const base64 = rec.base64 ?? null;
      const dataUrl =
        rec.dataUrl ??
        (base64
          ? base64.startsWith("data:")
            ? base64
            : `data:${rec.mime ?? "application/octet-stream"};base64,${base64}`
          : null);

      if (!dataUrl) {
        alert("Attachment record doesn't contain base64/dataUrl");
        return;
      }

      // convert to blob
      const parts = dataUrl.split(",");
      const meta = parts[0] ?? "";
      const isBase64 = meta.includes(";base64");
      let blob: Blob;
      if (isBase64) {
        const b64 = parts[1] ?? "";
        const binary = atob(b64);
        const len = binary.length;
        const u8 = new Uint8Array(len);
        for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
        const mime =
          (meta.match(/data:([^;]+);?/) || [])[1] ??
          rec.mime ??
          "application/octet-stream";
        blob = new Blob([u8], { type: mime });
      } else {
        // fallback: fetch the dataUrl (could be URL)
        const resp = await fetch(dataUrl);
        blob = await resp.blob();
      }

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (err) {
      console.error("openAttachmentById failed", err);
      alert("Failed to open attachment. See console.");
    }
  }
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student, course or agency..."
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
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium">{r.studentId}</div>
                      <div className="text-xs text-gray-500">
                        {r.studentEmail}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">{r.courseId}</td>
                  <td className="py-4 px-4">{r.agencyUserId}</td>
                  <td className="py-4 px-4">
                    {r.submittedAt
                      ? new Date(
                          r.submittedAt?.seconds
                            ? r.submittedAt.toDate()
                            : r.submittedAt
                        )
                          .toISOString()
                          .split("T")[0]
                      : "—"}
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(r.status)}</td>
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
                className="p-2 rounded hover:bg-gray-100"
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
                className="p-2 rounded hover:bg-gray-100"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <FileText />
                <div>
                  <div className="font-semibold">
                    {selectedRequest.courseTitle}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedRequest.studentName}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeModal}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <X />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium">Justification</label>
                <p className="mt-1">{selectedRequest.rationale}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Attachments</label>
                <div className="space-y-2 mt-2">
                  {(!selectedRequest.attachments ||
                    selectedRequest.attachments.length === 0) && (
                    <p className="text-sm text-gray-500">No attachments</p>
                  )}
                  {selectedRequest.attachments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <FileText />
                        <div>
                          <div className="font-medium text-sm">{doc.name}</div>
                          <div className="text-xs text-gray-500">
                            {doc.type} •{" "}
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

              <div>
                <label className="text-sm font-medium">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  className="w-full border rounded p-2"
                />
              </div>

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
