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
  Loader2,
} from "lucide-react";
import { exportToCSV } from "../utils/exportCSV";
import {
  acceptCertificateRequest,
  CertificateRequestDoc,
  getCertificateFilledTemplateById,
  getCertificateRequests,
  updateCertificateRequestStatus,
} from "../firebase/certificate-services";
import {
  dataUrlToBlob,
  normalizeToDataUrl,
} from "../utils/attachmentConverters";
import { fetchAttachmentDocById } from "../firebase/attachment-service";
import { useAuth } from "../context/AuthContext";

import {
  fetchCertificateFromBlockchain,
  updateCertificateOnBlockchain,
} from "../blockchain/service";
import { buildApprovedCertificateAsset } from "../blockchain/approval-mapper";
import { generateQrDataUrl } from "../utils/qr";
import {
  generateFinalImageWithQrAndStego,
  generateFinalPdfWithQr,
} from "../utils/certificate-qr-renderer";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [actionLoading, setActionLoading] = useState<
    "approve" | "reject" | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getCertificateRequests({
          authorityBodyId: abId ?? undefined,
        });
        setRequests(data);
        setError(null);
      } catch (err: any) {
        console.error("load requests failed", err);
        setError(err?.message ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [abId]);

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
    if (actionLoading) return;
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
      alert(t("certificateRequests.alerts.docIdMissing"));
      return;
    }

    try {
      const attach = await fetchAttachmentDocById(docRef.id);
      if (!attach) {
        alert(t("certificateRequests.alerts.attachmentNotFound"));
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
        alert(t("certificateRequests.alerts.noFileData"));
        return;
      }

      const blob = dataUrlToBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Failed to load attachment:", err);
      alert(t("certificateRequests.alerts.loadAttachmentFailed"));
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading("approve"); // 👈 start loader

    try {
      const reviewerName = abId ? `AB-${abId}` : "Authority Reviewer";
      const reviewedAt = new Date().toISOString();
      const studentId = selectedRequest.studentId ?? "";
      const certificate = await getCertificateFilledTemplateById(
        selectedRequest.id
      );

      const templateJson = certificate!.templateJson;

      //TODO
      const dummyUrl = selectedRequest.id;
      const qrDataUrl = await generateQrDataUrl(dummyUrl);

      const finalPdfBase64 = await generateFinalImageWithQrAndStego({
        templateJson: templateJson,
        qrDataUrl,
        certificateId: selectedRequest.id,
      });

      const { ipfsId, response } = await uploadPdfToIpfs(finalPdfBase64);
      const publicUrl = response.url;
      console.log("IPFS upload done. CID:", ipfsId);

      const { acceptedId } = await acceptCertificateRequest({
        requestId: selectedRequest.id,
        reviewerName,
        reviewedAt,
        studentId,
        url: publicUrl,
      });

      console.log("Moved to AcceptedCertificates id:", acceptedId);

      const certificateId = selectedRequest.id;

      try {
        const existingAsset = await fetchCertificateFromBlockchain(
          certificateId
        );

        const approvedAsset = buildApprovedCertificateAsset(existingAsset, {
          approverAbId: abId ?? null,
          reviewerName,
          remarks,
          approvedAt: reviewedAt,
        });

        const finalAsset = {
          ...approvedAsset,
          url: publicUrl,
          meta: {
            ...approvedAsset.meta,
            publicUrl,
          },
        };

        await updateCertificateOnBlockchain(certificateId, finalAsset);
        console.log("Blockchain asset updated to approved:", certificateId);
      } catch (bcErr) {
        console.error("Blockchain update failed:", bcErr);
      }

      const data = await getCertificateRequests({
        authorityBodyId: abId ?? undefined,
      });
      setRequests(data);
      closeModal();
    } catch (err: any) {
      console.error("approve failed", err);
      alert(
        t("certificateRequests.alerts.approveFailed", {
          message: err?.message || String(err),
        })
      );
    } finally {
      setActionLoading(null); // 👈 stop loader
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!remarks.trim()) {
      alert(t("certificateRequests.alerts.remarksRequired"));
      return;
    }
    setActionLoading("reject"); // 👈 start loader

    try {
      await updateCertificateRequestStatus(selectedRequest.id, {
        status: "rejected",
        rejectionComments: remarks,
        reviewedAt: new Date().toISOString(),
      });
      const data = await getCertificateRequests({
        authorityBodyId: abId ?? undefined,
      });
      setRequests(data);
      closeModal();
    } catch (err: any) {
      console.error("reject failed", err);
      alert(
        t("certificateRequests.alerts.rejectFailed", {
          message: err?.message || String(err),
        })
      );
    } finally {
      setActionLoading(null); // 👈 stop loader
    }
  };

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <Clock className="w-3 h-3" />
            <span>{t("certificateRequests.statusBadge.pending")}</span>
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>{t("certificateRequests.statusBadge.approved")}</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-3 h-3" />
            <span>{t("certificateRequests.statusBadge.rejected")}</span>
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            <span>{t("certificateRequests.statusBadge.withdrawn")}</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-700">{t("certificateRequests.loading")}</p>
    );
  if (error)
    return (
      <div className="p-6 text-red-600">
        {t("certificateRequests.errorPrefix")}: {error}
      </div>
    );

  const from = filteredRequests.length === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + itemsPerPage, filteredRequests.length);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold ml-8">
          {t("certificateRequests.title")}
        </h1>
        <button
          onClick={handleExport}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>{t("certificateRequests.exportCsv")}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 ml-8">
        {/* filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("certificateRequests.searchPlaceholder")}
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
              <option value="All">
                {t("certificateRequests.filters.all")}
              </option>
              <option value="pending">
                {t("certificateRequests.filters.pending")}
              </option>
              <option value="approved">
                {t("certificateRequests.filters.approved")}
              </option>
              <option value="rejected">
                {t("certificateRequests.filters.rejected")}
              </option>
              <option value="withdrawn">
                {t("certificateRequests.filters.withdrawn")}
              </option>
            </select>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-lg">
                <th className="text-left py-3 px-4">
                  {t("certificateRequests.table.student")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("certificateRequests.table.course")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("certificateRequests.table.agency")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("certificateRequests.table.submitted")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("certificateRequests.table.status")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("certificateRequests.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  {/* STUDENT: show name + ID (and email) */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-lg">
                        {r.studentName ||
                          t("certificateRequests.table.unknownStudent")}
                      </div>
                      <div className="text-sm font-mono text-gray-500">
                        {t("certificateRequests.table.idLabel")}{" "}
                        {r.studentId || t("certificateRequests.table.empty")}
                      </div>
                      {r.studentEmail && (
                        <div className="text-sm text-gray-500">
                          {r.studentEmail}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* COURSE: course name only in table */}
                  <td className="py-4 px-4 text-base">
                    {r.courseTitle || t("certificateRequests.table.empty")}
                  </td>

                  {/* AGENCY: agency name only in table */}
                  <td className="py-4 px-4 text-base">
                    {r.agencyName || t("certificateRequests.table.empty")}
                  </td>

                  {/* SUBMITTED DATE */}
                  <td className="py-4 px-4 text-base">
                    {r.submittedAt
                      ? new Date(
                          (r.submittedAt as any)?.seconds
                            ? (r.submittedAt as any).toDate()
                            : r.submittedAt
                        )
                          .toISOString()
                          .split("T")[0]
                      : t("certificateRequests.table.empty")}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4 ">
                    {getStatusBadge(r.status ?? "")}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openModal(r)}
                      className="px-3 py-1 rounded bg-blue-50 text-blue-600"
                    >
                      {t("certificateRequests.table.view")}
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
              {t("certificateRequests.pagination.showing", {
                from,
                to,
                total: filteredRequests.length,
              })}
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
                {t("certificateRequests.pagination.pageOf", {
                  page: currentPage,
                  totalPages,
                })}
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
                    {selectedRequest.courseTitle ||
                      t("certificateRequests.modal.titleFallback")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedRequest.studentName ||
                      t("certificateRequests.table.empty")}
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
                  <p className="text-xs text-gray-500 mb-1">
                    {t("certificateRequests.modal.requestId")}
                  </p>
                  <p className="font-mono text-xs break-all">
                    {selectedRequest.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {t("certificateRequests.modal.status")}
                  </p>
                  {getStatusBadge(selectedRequest.status ?? "")}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {t("certificateRequests.modal.student")}
                  </p>
                  <p className="font-medium">
                    {selectedRequest.studentName ||
                      t("certificateRequests.table.empty")}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    {t("certificateRequests.table.idLabel")}{" "}
                    {selectedRequest.studentId ||
                      t("certificateRequests.table.empty")}
                  </p>
                  {selectedRequest.studentEmail && (
                    <p className="text-xs text-gray-500">
                      {selectedRequest.studentEmail}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {t("certificateRequests.modal.course")}
                  </p>
                  <p className="font-medium">
                    {selectedRequest.courseTitle ||
                      t("certificateRequests.table.empty")}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    {t("certificateRequests.modal.courseIdLabel")}{" "}
                    {selectedRequest.courseId ||
                      t("certificateRequests.table.empty")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {t("certificateRequests.modal.agency")}
                  </p>
                  <p className="font-medium">
                    {selectedRequest.agencyName ||
                      t("certificateRequests.table.empty")}
                  </p>
                  <p className="text-xs font-mono text-gray-500">
                    {t("certificateRequests.modal.agencyUserIdLabel")}{" "}
                    {selectedRequest.agencyUserId ||
                      t("certificateRequests.table.empty")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {t("certificateRequests.modal.submittedAt")}
                  </p>
                  <p className="text-sm">
                    {selectedRequest.submittedAt
                      ? new Date(
                          (selectedRequest.submittedAt as any)?.seconds
                            ? (selectedRequest.submittedAt as any).toDate()
                            : selectedRequest.submittedAt
                        )
                          .toISOString()
                          .split("T")[0]
                      : t("certificateRequests.table.empty")}
                  </p>
                </div>
              </div>

              {/* Justification */}
              <div>
                <label className="text-sm font-medium">
                  {t("certificateRequests.modal.justification")}
                </label>
                <p className="mt-1 text-sm">
                  {selectedRequest.rationale ||
                    selectedRequest.notes ||
                    t("certificateRequests.table.empty")}
                </p>
              </div>

              {/* Attachments */}
              <div>
                <label className="text-sm font-medium">
                  {t("certificateRequests.modal.attachments")}
                </label>
                <div className="space-y-2 mt-2">
                  {(!selectedRequest.attachments ||
                    selectedRequest.attachments.length === 0) && (
                    <p className="text-sm text-gray-500">
                      {t("certificateRequests.modal.noAttachments")}
                    </p>
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
                            {doc.name ||
                              t(
                                "certificateRequests.modal.attachmentFallbackName"
                              )}
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
                        {t("certificateRequests.modal.viewAttachment")}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-sm font-medium">
                  {t("certificateRequests.modal.remarks")}
                </label>
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
                    disabled={!!actionLoading}
                    className="flex-1 bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "approve" && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <span>{t("certificateRequests.modal.approve")}</span>
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!!actionLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "reject" && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <span>{t("certificateRequests.modal.reject")}</span>
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

function base64ToBlob(base64: string, contentType = "application/pdf") {
  const byteCharacters = atob(base64);
  const byteArrays: Uint8Array[] = [];

  const sliceSize = 1024;
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

async function uploadPdfToIpfs(finalPdfBase64: string) {
  const pdfBlob = base64ToBlob(finalPdfBase64, "application/img");
  const file = new File([pdfBlob], "certificate.jpg", {
    type: "application/img",
  });

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://ipfs-mze2.onrender.com/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `IPFS upload failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  const json = await res.json().catch(() => ({} as any));
  const ipfsId = json.cid || json.hash || json.id || json.IpfsHash || null;

  console.log("IPFS upload response:", json);
  console.log("IPFS ID / CID:", ipfsId);

  return { ipfsId, response: json };
}
