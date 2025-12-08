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
  Loader2,
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
import { useTranslation } from "react-i18next";

const itemsPerPage = 10;

const CourseClaims: React.FC = () => {
  const { abId } = useAuth();
  const { t } = useTranslation();

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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // loader for approve/reject
  const [actionLoading, setActionLoading] = useState<
    "approve" | "reject" | null
  >(null);

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
        setError(err.message || t("courseClaims.alerts.loadAttachmentFailed"));
      } finally {
        setLoading(false);
      }
    };
    loadClaims();
  }, [abId, t]);

  /* ---------- derived lists ---------- */
  const filteredClaims = claims.filter((claim) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      claim.courseTitle.toLowerCase().includes(q) ||
      claim.agencyName.toLowerCase().includes(q) ||
      (claim.rationale || "").toLowerCase().includes(q);

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

  const from = filteredClaims.length === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + itemsPerPage, filteredClaims.length);

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
    if (actionLoading) return; // don't close while processing
    setSelectedClaim(null);
    setRemarks("");
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <Clock className="w-3 h-3" />
            <span>{t("courseClaims.statusBadge.pending")}</span>
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>{t("courseClaims.statusBadge.approved")}</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-3 h-3" />
            <span>{t("courseClaims.statusBadge.rejected")}</span>
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            <Clock className="w-3 h-3" />
            <span>{t("courseClaims.statusBadge.withdrawn")}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getLevelBadge = (level: string | number | undefined) => {
    if (!level && level !== 0) {
      return (
        <span className="px-2 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700">
          {t("courseClaims.level.na")}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700">
        {typeof level === "number" ? `NSQF ${level}` : level}
      </span>
    );
  };

  /* ---------- approve / reject handlers ---------- */
  const handleApprove = async () => {
    if (!selectedClaim) return;
    setActionLoading("approve");
    try {
      await approveCourseClaimRequest(selectedClaim.id, abId || "");

      setClaims((prev) => prev.filter((c) => c.id !== selectedClaim.id));
      closeModal();
    } catch (err: any) {
      console.error(err);
      alert(
        t("courseClaims.alerts.approveFailed", {
          message: err.message || String(err),
        })
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    if (!remarks.trim()) {
      alert(t("courseClaims.alerts.remarksRequired"));
      return;
    }

    setActionLoading("reject");
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
      alert(
        t("courseClaims.alerts.rejectFailed", {
          message: err.message || String(err),
        })
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDocument = async (docRef: {
    id: string;
    name?: string;
    type?: string;
    size?: number;
  }) => {
    if (!docRef?.id) {
      alert(t("courseClaims.alerts.docIdMissing"));
      return;
    }

    try {
      const attach = await fetchAttachmentDocById(docRef.id);
      if (!attach) {
        alert(t("courseClaims.alerts.attachmentNotFound"));
        return;
      }

      const dataUrl =
        attach.dataUrl ||
        (attach.base64
          ? normalizeToDataUrl(
              attach.base64,
              attach.mimeType ?? docRef.type ?? "application/pdf"
            )
          : null);

      if (!dataUrl) {
        alert(t("courseClaims.alerts.noFileData"));
        return;
      }

      const blob = dataUrlToBlob(dataUrl);
      const url = URL.createObjectURL(blob);

      const isDesktop =
        typeof window !== "undefined" ? window.innerWidth >= 1024 : true;

      if (isDesktop) {
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else {
        setPreviewUrl(url);
      }
    } catch (err) {
      console.error("Failed to load attachment:", err);
      alert(t("courseClaims.alerts.loadAttachmentFailed"));
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  /* ---------- render ---------- */
  if (loading) {
    return <p className="p-6 text-gray-700">{t("courseClaims.loading")}</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {t("courseClaims.errorPrefix")}: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 ml-8">
          {t("courseClaims.title")}
        </h1>
        <button
          onClick={handleExport}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>{t("courseClaims.exportCsv")}</span>
        </button>
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 ml-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("courseClaims.searchPlaceholder")}
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
              <option value="All">{t("courseClaims.filters.all")}</option>
              <option value="Pending">
                {t("courseClaims.filters.pending")}
              </option>
              <option value="Approved">
                {t("courseClaims.filters.approved")}
              </option>
              <option value="Rejected">
                {t("courseClaims.filters.rejected")}
              </option>
              <option value="Withdrawn">
                {t("courseClaims.filters.withdrawn")}
              </option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-lg">
                <th className="text-left py-3 px-4">
                  {t("courseClaims.table.courseTitle")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("courseClaims.table.agency")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("courseClaims.table.level")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("courseClaims.table.submitted")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("courseClaims.table.status")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("courseClaims.table.actions")}
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
                    <p className="text-lg font-medium text-gray-900">
                      {claim.courseTitle}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-base text-gray-600">
                    {claim.agencyName}
                  </td>
                  <td className="py-4 px-4">{getLevelBadge("temporary")}</td>
                  <td className="py-4 px-4 text-base text-gray-600">
                    {claim.submittedDate}
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(claim.status)}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openModal(claim)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {t("courseClaims.table.view")}
                      </span>
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
                    {t("courseClaims.table.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t("courseClaims.pagination.showing", {
                from,
                to,
                total: filteredClaims.length,
              })}
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
                {t("courseClaims.pagination.pageOf", {
                  page: currentPage,
                  totalPages,
                })}
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

      {/* Claim Details Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {t("courseClaims.modal.title")}
              </h2>
              <button
                onClick={closeModal}
                disabled={!!actionLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("courseClaims.modal.courseTitle")}
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedClaim.courseTitle}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("courseClaims.modal.justification")}
                </label>
                <p className="text-gray-700 mt-1">
                  {selectedClaim.rationale || t("courseClaims.table.empty")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("courseClaims.modal.agency")}
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedClaim.agencyName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("courseClaims.modal.status")}
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t("courseClaims.modal.submittedDate")}
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedClaim.submittedDate}
                  </p>
                </div>
                {selectedClaim.reviewedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t("courseClaims.modal.reviewedDate")}
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedClaim.reviewedDate}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("courseClaims.modal.tagsLabel")}
                </label>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Tag className="w-3 h-3" />
                    <span>{t("courseClaims.modal.tagCourseClaim")}</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("courseClaims.modal.attachments")}
                </label>
                <div className="space-y-2">
                  {selectedClaim.documents.length === 0 && (
                    <p className="text-sm text-gray-500">
                      {t("courseClaims.modal.noAttachments")}
                    </p>
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
                            {doc.name ||
                              t("courseClaims.modal.attachmentFallbackName")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.type} • {(doc.size / 1024).toFixed(1)} KB
                          </p>
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
                        {t("courseClaims.modal.viewAttachment")}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("courseClaims.modal.remarksLabel")}{" "}
                  {selectedClaim.status.toLowerCase() === "pending" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={t("courseClaims.modal.remarksPlaceholder")}
                  rows={4}
                  disabled={selectedClaim.status.toLowerCase() !== "pending"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {selectedClaim.status.toLowerCase() === "pending" && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleApprove}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "approve" && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {t("courseClaims.modal.approve")}
                    </span>
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "reject" && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {t("courseClaims.modal.reject")}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📱 Mobile PDF Viewer Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-gray-300">
                PDF Preview
              </p>
            </div>
            <button
              onClick={handleClosePreview}
              className="p-1 rounded hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <iframe
            src={previewUrl}
            title="Document PDF"
            className="flex-1 w-full bg-gray-900"
          />
        </div>
      )}
    </div>
  );
};

export default CourseClaims;
