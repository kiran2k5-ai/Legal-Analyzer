import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import { api } from "../services/api";
import { 
  FileUp, 
  Trash2, 
  FileText, 
  FileWarning, 
  CheckCircle, 
  Loader2, 
  Sparkles,
  BookOpen
} from "lucide-react";

function Upload() {
  const { documents, fetchDocuments, token } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [summaries, setSummaries] = useState({});
  const [loadingSummaryId, setLoadingSummaryId] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      setSuccess("");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await api.uploadDocument(file);
      setSuccess(`"${file.name}" uploaded and vectorized successfully!`);
      setFile(null);
      fetchDocuments();
    } catch (err) {
      setError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document? All corresponding vector embeddings will be permanently erased.")) {
      return;
    }

    try {
      await api.deleteDocument(docId);
      fetchDocuments();
      if (activeSummary && activeSummary.docId === docId) {
        setActiveSummary(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete document.");
    }
  };

  const handleGetSummary = async (doc) => {
    // If already showing this summary, close it
    if (activeSummary && activeSummary.docId === doc.doc_id) {
      setActiveSummary(null);
      return;
    }

    if (summaries[doc.doc_id]) {
      setActiveSummary({
        docId: doc.doc_id,
        filename: doc.filename,
        summary: summaries[doc.doc_id]
      });
      return;
    }

    setLoadingSummaryId(doc.doc_id);
    try {
      const data = await api.getDocumentSummary(doc.doc_id);
      setSummaries(prev => ({ ...prev, [doc.doc_id]: data.summary }));
      setActiveSummary({
        docId: doc.doc_id,
        filename: doc.filename,
        summary: data.summary
      });
    } catch (err) {
      setError(err.message || "Failed to retrieve document summary.");
    } finally {
      setLoadingSummaryId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5FA] text-[#081827]">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-8 pt-32 pb-16">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-5xl font-bold tracking-tight text-[#081827]">
            Institutional Knowledge Base
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Upload PDF legal documents to parse, vectorize, and analyze.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[40%_60%]">
          
          {/* Left Column: Upload Box */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold font-serif mb-6 text-[#081827]">
                Upload Document
              </h2>

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                
                {/* Drag-n-drop or File Input */}
                <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition hover:bg-gray-100">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <FileUp size={40} className="text-gray-400 mb-4" />
                  <p className="text-sm font-semibold text-gray-700">
                    Click or drag PDF file to upload
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    PDF files only, up to 25MB
                  </p>
                </div>

                {file && (
                  <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                    <FileText className="text-yellow-600" size={20} />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-yellow-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-yellow-600">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-600">
                    <FileWarning size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-2 text-sm text-green-600">
                    <CheckCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="flex w-full items-center justify-center rounded bg-[#081827] px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={18} />
                      Vectorizing & Extracting...
                    </>
                  ) : (
                    "Upload and Index"
                  )}
                </button>
              </form>
            </div>

            {/* Active Executive Summary Panel */}
            {activeSummary && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b pb-4 border-gray-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={20} />
                    <h3 className="font-serif font-bold text-lg text-[#081827]">
                      Executive Summary
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveSummary(null)}
                    className="text-xs font-semibold text-gray-400 hover:text-black cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <h4 className="font-semibold text-sm text-gray-400 mb-2 truncate">
                  {activeSummary.filename}
                </h4>
                <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap max-h-[350px] overflow-y-auto pr-2">
                  {activeSummary.summary}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Library File List */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold font-serif mb-6 text-[#081827]">
              Document Library
            </h2>

            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <BookOpen size={48} className="mb-4 text-gray-300" />
                <p className="text-sm font-medium">No documents in library.</p>
                <p className="text-xs mt-1">Upload a PDF to build your knowledge base.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <div key={doc.doc_id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* File Info */}
                    <div className="flex items-start gap-3 flex-1 overflow-hidden">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <FileText size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="truncate font-semibold text-slate-900" title={doc.filename}>
                          {doc.filename}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
                          <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{doc.total_chunks} chunks</span>
                          <span>•</span>
                          <span>
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        onClick={() => handleGetSummary(doc)}
                        disabled={loadingSummaryId === doc.doc_id}
                        className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                      >
                        {loadingSummaryId === doc.doc_id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Sparkles size={14} className="text-yellow-500" />
                        )}
                        {activeSummary?.docId === doc.doc_id ? "Hide Summary" : "Summarize"}
                      </button>

                      <button
                        onClick={() => handleDelete(doc.doc_id)}
                        className="rounded p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Upload;
