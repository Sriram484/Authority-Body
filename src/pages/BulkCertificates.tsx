import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, RefreshCw } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

type Certificate = {
  certificateid: string;
  courseid?: string;
  aadhar?: string;
  aaid?: string;
  abid?: string;
  url?: string | null;
};

export default function BulkCertificatesPage(): JSX.Element {
  const { abId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [rows, setRows] = useState<Certificate[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (abId) {
      fetchCertificates();
    }
  }, [abId]);

  async function fetchCertificates() {
    if (!abId) return;

    setLoadingRows(true);
    setError(null);

    try {
      const url = `http://localhost:3010/api/certificates/abid/${encodeURIComponent(
        abId
      )}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const text = await res.text();

      if (text.trim().startsWith("<")) {
        throw new Error("Server returned HTML instead of JSON.");
      }

      const json = JSON.parse(text);

      if (!res.ok) {
        throw new Error(json?.message || `Failed to fetch (status ${res.status})`);
      }

      setRows(json.data || []);
    } catch (err: any) {
      setError(err.message || "Error fetching certificates");
    } finally {
      setLoadingRows(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  // -------------------------
  // Convert ms → readable seconds
  // -------------------------
  function formatMsToReadable(ms: number | undefined) {
    if (!ms) return "0s";
    if (ms < 1000) return `${ms} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
    const m = Math.floor(ms / 60000);
    const s = ((ms % 60000) / 1000).toFixed(2);
    return `${m}m ${s}s`;
  }

  // -------------------------
  // File Upload Handler
  // -------------------------
  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.currentTarget.value = "";

    const allowed = [".csv", ".xlsx", ".xls"];
    const ext = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    if (!allowed.includes("." + ext)) {
      setStatusMessage("Please upload a CSV or Excel file.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setUploading(true);
      setProgress(0);
      setStatusMessage("Starting upload...");

      const response = await axios.post(
        "http://localhost:3010/api/upload-csv",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percent);
              setStatusMessage(`Uploading... ${percent}%`);
            }
          },
          timeout: 1000 * 60 * 5,
        }
      );

      // extract response
      const data = response.data || {};
      const durationPretty = formatMsToReadable(data.durationMs);

      if (data.success) {
        setStatusMessage(
          `Upload complete → Total: ${data.total}, Inserted: ${data.inserted}, Errors: ${data.errors}, Duration: ${durationPretty}`
        );
      } else {
        setStatusMessage(
          `Upload finished with response: ${JSON.stringify(data)}`
        );
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Upload failed";
      setStatusMessage(`Upload failed: ${msg}`);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 300);
      if (abId) fetchCertificates();
    }
  }

  const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));
  const handleNextPage = () =>
    setPage((p) => Math.min(Math.ceil(rows.length / rowsPerPage) - 1, p + 1));
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const displayedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const styles = `
  .container { padding: 16px; font-family: Inter, system-ui; }
  .controls { display:flex; gap:12px; align-items:center; margin-bottom:12px; flex-wrap:wrap }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; border:1px solid #e0e0e0; background:white; cursor:pointer }
  .btn.primary { background:#1976d2; color:white; border-color:transparent }
  .btn.ghost { background:transparent }
  .status { margin-left:8px; color:#555 }
  .card { background:white; border:1px solid #e6e6e6; border-radius:8px; overflow:hidden }
  table { width:100%; border-collapse:collapse; }
  th, td { padding:10px; border-bottom:1px solid #f3f3f3 }
  .muted { color:#777 }
  .pagination { display:flex; justify-content:space-between; padding:12px 16px; }
  .overlay { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:9999 }
  .loader { width:48px; height:48px; border:4px solid rgba(255,255,255,0.2); border-top-color:white; border-radius:50%; animation:spin 1s linear infinite }
  @keyframes spin { to { transform:rotate(360deg) }}
  `;

  return (
    <div className="container">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <h2>Bulk Upload Certificates</h2>

      <div className="controls">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        <button className="btn primary" onClick={openFilePicker}>
          <UploadCloud size={16} /> <span>Bulk Upload</span>
        </button>

        <button className="btn ghost" onClick={() => abId && fetchCertificates()}>
          <RefreshCw size={16} /> <span>Refresh</span>
        </button>

        {statusMessage && <div className="status">{statusMessage}</div>}
      </div>

      <div className="card">
        <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <strong>Certificates for AB: </strong>
          <span className="muted">{abId || "N/A"}</span>
        </div>

        <div style={{ padding: 16 }}>
          {loadingRows ? (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div className="loader" />
            </div>
          ) : error ? (
            <div style={{ color: "#c62828" }}>{error}</div>
          ) : rows.length === 0 ? (
            <div className="muted">No certificates found.</div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Certificate ID</th>
                      <th>Course ID</th>
                      <th>Aadhar</th>
                      <th>AA ID</th>
                      <th>AB ID</th>
                      <th>PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRows.map((r) => (
                      <tr key={r.certificateid}>
                        <td>{r.certificateid}</td>
                        <td>{r.courseid || "—"}</td>
                        <td>{r.aadhar || "—"}</td>
                        <td>{r.aaid || "—"}</td>
                        <td>{r.abid || "—"}</td>
                        <td>
                          {r.url ? (
                            <a href={r.url} target="_blank" rel="noreferrer">
                              View PDF
                            </a>
                          ) : (
                            <span className="muted">No PDF</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" onClick={handlePrevPage} disabled={page === 0}>
                    Prev
                  </button>
                  <button
                    className="btn"
                    onClick={handleNextPage}
                    disabled={page >= Math.ceil(rows.length / rowsPerPage) - 1}
                  >
                    Next
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <label className="muted">Rows per page</label>
                  <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {uploading && (
        <div className="overlay">
          <div style={{ textAlign: "center", color: "white" }}>
            <div
              className="loader"
              style={{ width: 60, height: 60, borderWidth: 6 }}
            />
            <div style={{ marginTop: 12, fontWeight: 600 }}>
              Uploading... {progress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
