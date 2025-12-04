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
  Tag,
} from "lucide-react";
import { exportToCSV } from "../utils/exportCSV";
import {
  getCourseClaimRequests,
  approveCourseClaimRequest,
  rejectCourseClaimRequest,
  CourseClaimRequest,
  fetchAttachmentDocById,
} from "../firebase/course-claim-service";
import { useAuth } from "../context/AuthContext";
import {
  dataUrlToBlob,
  normalizeToDataUrl,
} from "../utils/attachmentConverters";

const itemsPerPage = 10;

const CourseClaims: React.FC = () => {
  const { abId } = useAuth();

  const [claims, setClaims] = useState<CourseClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedClaim, setSelectedClaim] = useState<CourseClaimRequest | null>(
    null
  );
  const [remarks, setRemarks] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  console.log(selectedClaim);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /* ---------- load from Firestore ---------- */
  useEffect(() => {
    const loadClaims = async () => {
      try {
        setLoading(true);
        const data = await getCourseClaimRequests(abId || "");
        setClaims(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load course claims");
      } finally {
        setLoading(false);
      }
    };
    loadClaims();
  }, []);

  /* ---------- derived lists ---------- */
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.rationale || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      claim.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClaims = filteredClaims.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* ---------- helpers ---------- */
  const handleExport = () => {
    const exportData = filteredClaims.map((c) => ({
      ID: c.id,
      CourseTitle: c.courseTitle,
      Agency: c.agencyName,
      Status: c.status,
      SubmittedDate: c.submittedDate,
      ReviewedDate: c.reviewedDate || "N/A",
      Remarks: c.rejectionComments || "",
    }));
    exportToCSV(exportData, "course-claims");
  };

  const openModal = (claim: CourseClaimRequest) => {
    setSelectedClaim(claim);
    setRemarks(claim.rejectionComments || "");
  };

  const closeModal = () => {
    setSelectedClaim(null);
    setRemarks("");
  };

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

  const getLevelBadge = (level: string | number | undefined) => {
    if (!level && level !== 0) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
          N/A
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
        {typeof level === "number" ? `NSQF ${level}` : level}
      </span>
    );
  };

  /* ---------- approve / reject handlers ---------- */
  const handleApprove = async () => {
    if (!selectedClaim) return;
    try {
      await approveCourseClaimRequest(selectedClaim.id, abId || "");

      // remove from UI (since doc is deleted)
      setClaims((prev) => prev.filter((c) => c.id !== selectedClaim.id));

      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to approve claim");
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    if (!remarks.trim()) {
      alert("Please provide remarks before rejecting");
      return;
    }

    try {
      const updated = await rejectCourseClaimRequest(
        selectedClaim.id,
        remarks,
        "Authority Reviewer",
        abId || ""
      );

      setClaims((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedClaim(updated);
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to reject claim");
    }
  };

  // const handleViewDocument = async (docRef: {
  //   id: string;
  //   name?: string;
  //   type?: string;
  //   size?: number;
  // }) => {
  //   if (!docRef?.id) {
  //     alert("Document id missing");
  //     return;
  //   }
  //   setPreviewLoading(true);
  //   try {
  //     const attach = await fetchAttachmentDocById(docRef.id);
  //     if (!attach) {
  //       alert("Attachment not found");
  //       return;
  //     }

  //     // prefer dataUrl (complete), else build from base64 + mimeType
  //     const maybeDataUrl =
  //       attach.dataUrl ??
  //       (attach.base64
  //         ? normalizeToDataUrl(
  //             attach.base64,
  //             attach.mimeType ?? attach.mimeType
  //           )
  //         : null);

  //     if (!maybeDataUrl) {
  //       alert("Attachment content missing (no base64/dataUrl stored).");
  //       return;
  //     }

  //     const blob = dataUrlToBlob(maybeDataUrl);
  //     const url = URL.createObjectURL(blob);

  //     setPreviewUrl(url);
  //     setPreviewName(
  //       attach.filename ?? docRef.name ?? `attachment-${docRef.id}`
  //     );
  //     setPreviewMime(attach.mimeType ?? docRef.type ?? blob.type);
  //     setIsPreviewOpen(true);
  //   } catch (err: any) {
  //     console.error("Failed to load attachment:", err);
  //     alert("Failed to load attachment. See console.");
  //   } finally {
  //     setPreviewLoading(false);
  //   }
  // };

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

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewName(null);
    setPreviewMime(null);
  };

  /* ---------- render ---------- */
  if (loading) {
    return <p className="p-6 text-gray-700">Loading course claim requests…</p>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Course Claim Requests
        </h1>
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
              placeholder="Search by course title, agency, or rationale..."
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
              <option>Withdrawn</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Course Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Agency
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Level
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Submitted
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedClaims.map((claim) => (
                <tr
                  key={claim.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-gray-900">
                      {claim.courseTitle}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {claim.agencyName}
                  </td>
                  <td className="py-4 px-4">{getLevelBadge("temporary")}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {claim.submittedDate}
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(claim.status)}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openModal(claim)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedClaims.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    No course claim requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredClaims.length)} of{" "}
              {filteredClaims.length}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Course Claim Details
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Course Title
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedClaim.courseTitle}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Justification / Rationale
                </label>
                <p className="text-gray-700 mt-1">
                  {selectedClaim.rationale || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Agency
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedClaim.agencyName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Submitted Date
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedClaim.submittedDate}
                  </p>
                </div>
                {selectedClaim.reviewedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Reviewed Date
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedClaim.reviewedDate}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Assuming no tags in schema; you can wire from Firestore later */}
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Tag className="w-3 h-3" />
                    <span>Course Claim</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Attached Documents
                </label>
                <div className="space-y-2">
                  {selectedClaim.documents.length === 0 && (
                    <p className="text-sm text-gray-500">No attachments.</p>
                  )}
                  {selectedClaim.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.type} • {(doc.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        {/* <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View
                        </button> */}
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Remarks{" "}
                  {selectedClaim.status.toLowerCase() === "pending" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your review comments here..."
                  rows={4}
                  disabled={selectedClaim.status.toLowerCase() !== "pending"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {selectedClaim.status.toLowerCase() === "pending" && (
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

export default CourseClaims;
