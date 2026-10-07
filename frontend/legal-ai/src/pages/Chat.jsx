import React, { useState, useEffect, useContext, useRef } from "react";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import { api } from "../services/api";
import { 
  Send, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  PlusCircle,
  Trash2,
  UploadCloud,
  FilePlus,
  Clock,
  History,
  FolderOpen
} from "lucide-react";
import { Link } from "react-router-dom";

function Chat() {
  const { documents, fetchDocuments, token } = useContext(AppContext);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCitations, setActiveCitations] = useState([]);
  const [selectedCitation, setSelectedCitation] = useState(null);

  // ChatGPT-style Multi-Session State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Sidebar management
  const [sidebarTab, setSidebarTab] = useState("docs"); // "docs" | "history"
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Fetch list of saved consultation sessions (ChatGPT style)
  const fetchSessions = async () => {
    try {
      const res = await api.getChatSessions();
      if (res && res.sessions) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.error("Error loading chat sessions:", err);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchDocuments();
      fetchSessions();
    }
  }, [token]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a chat message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userQuery = prompt;
    setPrompt("");
    setLoading(true);

    // Optimistically append user message
    setMessages((prev) => [
      ...prev, 
      { sender: "user", text: userQuery, timestamp: new Date().toISOString() }
    ]);

    try {
      const response = await api.sendChatMessage(userQuery, currentSessionId);
      
      // Update session ID if it was a new consultation
      if (response.session_id) {
        setCurrentSessionId(response.session_id);
      }

      // Append AI message
      setMessages((prev) => [
        ...prev, 
        { 
          sender: "ai", 
          text: response.answer, 
          citations: response.citations,
          timestamp: new Date().toISOString()
        }
      ]);

      // Set current citations to show on the right panel
      if (response.citations && response.citations.length > 0) {
        setActiveCitations(response.citations);
        setSelectedCitation(response.citations[0]);
      } else {
        setActiveCitations([]);
        setSelectedCitation(null);
      }

      // Refresh the sessions list so new conversation appears in the sidebar
      fetchSessions();

    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { 
          sender: "ai", 
          text: `Error: ${err.message || "Failed to get response from server."}`, 
          isError: true 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCitationClick = (citation) => {
    setSelectedCitation(citation);
  };

  // Start a new consultation: ONLY clears the active screen, DOES NOT erase history!
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setActiveCitations([]);
    setSelectedCitation(null);
  };

  // Switch to a previous consultation session
  const handleSelectSession = async (sessionId) => {
    if (sessionId === currentSessionId) return;

    setCurrentSessionId(sessionId);
    setLoading(true);
    try {
      const detail = await api.getSessionDetail(sessionId);
      const sessionMessages = detail.messages || [];
      setMessages(sessionMessages);

      // Find citations from last AI message
      const lastAiMsg = [...sessionMessages].reverse().find((m) => m.sender === "ai");
      if (lastAiMsg && lastAiMsg.citations && lastAiMsg.citations.length > 0) {
        setActiveCitations(lastAiMsg.citations);
        setSelectedCitation(lastAiMsg.citations[0]);
      } else {
        setActiveCitations([]);
        setSelectedCitation(null);
      }
    } catch (err) {
      console.error("Failed to load consultation session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a single conversation session
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this consultation from history?")) {
      return;
    }

    try {
      await api.deleteChatSession(sessionId);
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      fetchSessions();
    } catch (err) {
      console.error("Failed to delete session:", err);
      alert(err.message || "Failed to delete session.");
    }
  };

  // Add PDF directly from sidebar
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    try {
      await api.uploadDocument(file);
      await fetchDocuments();
      setSidebarTab("docs"); // Make sure documents tab is visible
    } catch (err) {
      console.error("Failed to upload document:", err);
      alert(err.message || "Failed to upload and index document.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove PDF directly from sidebar
  const handleDeleteDocument = async (e, docId, filename) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${filename}" from your knowledge base?`)) {
      return;
    }

    setDeletingId(docId);
    try {
      await api.deleteDocument(docId);
      await fetchDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert(err.message || "Failed to remove document.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#F4F5FA] text-[#081827] overflow-hidden">
      <Navbar />

      {/* Main Workspace */}
      <div className="flex flex-1 pt-20 overflow-hidden">
        
        {/* Left Panel: ChatGPT-Style Sidebar */}
        <aside className="hidden w-[320px] flex-col border-r border-gray-200 bg-white p-5 lg:flex shadow-sm">
          
          {/* New Consultation Button (Does NOT erase history, just starts a fresh screen) */}
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#081827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black cursor-pointer mb-4 shadow-sm"
          >
            <PlusCircle size={16} />
            Start New Consultation
          </button>

          {/* Hidden File Input for Sidebar PDF upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />

          {/* Sidebar Segment Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-4 border border-slate-200/60">
            <button
              onClick={() => setSidebarTab("docs")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                sidebarTab === "docs"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FolderOpen size={13} />
              <span>PDFs</span>
              <span className="ml-1 rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-mono text-slate-700">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setSidebarTab("history")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                sidebarTab === "history"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <History size={13} />
              <span>History</span>
              <span className="ml-1 rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-mono text-slate-700">
                {sessions.length}
              </span>
            </button>
          </div>

          {/* TAB 1: KNOWLEDGE BASE (ADD / REMOVE PDFS IN-PLACE) */}
          {sidebarTab === "docs" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Knowledge Base
                </span>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition disabled:opacity-50"
                  title="Upload a new PDF document"
                >
                  <FilePlus size={14} />
                  <span>+ Add PDF</span>
                </button>
              </div>

              {/* Uploading progress banner */}
              {uploading && (
                <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-blue-50 border border-blue-200 p-3 text-blue-700 text-xs">
                  <Loader2 size={16} className="animate-spin shrink-0 text-blue-600" />
                  <span className="font-medium">Extracting & indexing embeddings...</span>
                </div>
              )}

              {/* Document List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {documents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-400">
                    <UploadCloud size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">No PDFs active</p>
                    <p className="text-[11px] text-slate-400 mt-1">Upload a PDF to start querying</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#081827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black transition cursor-pointer"
                    >
                      <FilePlus size={12} />
                      Upload PDF
                    </button>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.doc_id}
                      className="group relative flex items-center justify-between rounded-lg border border-slate-200/70 bg-slate-50/70 p-2.5 hover:bg-white hover:border-slate-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-200/60 text-slate-600">
                          <FileText size={14} />
                        </div>
                        <div className="min-w-0">
                          <p 
                            className="truncate text-xs font-semibold text-slate-800" 
                            title={doc.filename}
                          >
                            {doc.filename}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {doc.total_chunks ? `${doc.total_chunks} chunks` : "Indexed"}
                          </p>
                        </div>
                      </div>

                      {/* Remove / Delete Button */}
                      <button
                        onClick={(e) => handleDeleteDocument(e, doc.doc_id, doc.filename)}
                        disabled={deletingId === doc.doc_id}
                        className="opacity-70 group-hover:opacity-100 flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                        title="Delete from knowledge base"
                      >
                        {deletingId === doc.doc_id ? (
                          <Loader2 size={13} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Add at bottom */}
              {documents.length > 0 && (
                <div className="pt-3 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 hover:border-slate-900 hover:text-slate-900 transition cursor-pointer"
                  >
                    <FilePlus size={14} />
                    <span>Upload Another PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHAT HISTORY (PRESERVED SESSIONS LIKE CHATGPT) */}
          {sidebarTab === "history" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Saved Consultations
                </span>

                <button
                  onClick={handleNewChat}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  title="New consultation"
                >
                  + New
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                {sessions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-400">
                    <Clock size={24} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">No past consultations</p>
                    <p className="text-[11px] text-slate-400 mt-1">Each conversation is automatically saved here</p>
                  </div>
                ) : (
                  sessions.map((session) => {
                    const isActive = session.session_id === currentSessionId;
                    return (
                      <div
                        key={session.session_id}
                        onClick={() => handleSelectSession(session.session_id)}
                        className={`group w-full flex items-center justify-between gap-2 rounded-lg p-2.5 text-xs transition cursor-pointer ${
                          isActive
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <MessageSquare 
                            size={14} 
                            className={`mt-0.5 shrink-0 ${
                              isActive ? "text-yellow-400" : "text-slate-400 group-hover:text-slate-800"
                            }`} 
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`truncate font-medium ${isActive ? "text-white" : "text-slate-800"}`}>
                              {session.title || "Consultation"}
                            </p>
                            <p className={`text-[10px] mt-0.5 ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                              {session.updated_at 
                                ? new Date(session.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                : `${session.message_count || 0} messages`}
                            </p>
                          </div>
                        </div>

                        {/* Delete Session Button */}
                        <button
                          onClick={(e) => handleDeleteSession(e, session.session_id)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition hover:text-red-400 cursor-pointer ${
                            isActive ? "text-slate-400" : "text-slate-400 hover:bg-slate-200"
                          }`}
                          title="Delete consultation"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </aside>

        {/* Center Panel: Chat Interface */}
        <main className="flex flex-1 flex-col bg-[#F8F9FB] overflow-hidden">
          
          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12">
            <div className="mx-auto max-w-3xl space-y-6">
              
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                    <MessageSquare size={36} className="text-[#081827]" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-[#081827]">
                    Legal Consultation Portal
                  </h2>
                  <p className="mt-3 max-w-md text-gray-500">
                    Query your active document base. All legal answers are verified and mapped directly to citations.
                  </p>
                  
                  {documents.length === 0 && (
                    <div className="mt-8 flex items-center gap-2 rounded-lg bg-yellow-50 p-4 border border-yellow-200 max-w-sm text-yellow-800 text-sm text-left">
                      <AlertCircle size={18} className="shrink-0 text-yellow-600" />
                      <div>
                        <strong>No documents active:</strong> Click{" "}
                        <button 
                          onClick={() => fileInputRef.current?.click()} 
                          className="font-semibold underline cursor-pointer"
                        >
                          + Add PDF
                        </button>{" "}
                        in the sidebar to begin.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 rounded-xl p-1 transition-all ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    
                    {msg.sender === "ai" && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-serif text-xs font-bold shadow-sm">
                        AI
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-6 shadow-sm border ${
                        msg.sender === "user"
                          ? "bg-[#081827] text-white border-[#081827]"
                          : msg.isError
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-white text-gray-800 border-slate-200"
                      }`}
                    >
                      
                      <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>

                      {/* Display inline citations if present */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-yellow-600 flex items-center gap-1.5">
                            <Sparkles size={12} />
                            Verified Citations:
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.citations.map((cit, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setActiveCitations(msg.citations);
                                  setSelectedCitation(cit);
                                }}
                                className="flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 transition px-2 py-1 text-xs font-medium text-slate-700 cursor-pointer border border-slate-200/50"
                              >
                                <span className="max-w-[120px] truncate">{cit.document}</span>
                                <span className="font-semibold text-slate-500">[C{cit.chunk_index}]</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    {msg.sender === "user" && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-semibold text-xs shadow-sm">
                        You
                      </div>
                    )}

                  </div>
                ))
              )}

              {loading && (
                <div className="flex gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-serif text-xs font-bold">
                    AI
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                    <Loader2 className="animate-spin text-slate-500" size={18} />
                    <span className="text-sm text-gray-500 font-medium">
                      Consulting knowledge base, synthesizing response...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Prompt input Form */}
          <div className="border-t border-gray-200 bg-white px-6 py-4 md:px-12">
            <form onSubmit={handleSendChat} className="mx-auto max-w-3xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    documents.length === 0 
                      ? "Please upload a document to get started..." 
                      : "Query document base (e.g., 'What are the liability limits?')..."
                  }
                  disabled={documents.length === 0 || loading}
                  className="h-14 w-full rounded-xl border border-gray-300 bg-slate-50 pl-6 pr-16 text-sm outline-none transition focus:border-yellow-500 focus:bg-white disabled:bg-gray-100 disabled:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || loading || documents.length === 0}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-[#081827] text-white hover:bg-black transition disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>

        </main>

        {/* Right Panel: Citations Inspector */}
        {activeCitations.length > 0 && (
          <aside className="hidden w-[340px] flex-col border-l border-gray-200 bg-white xl:flex overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 p-6">
              <h3 className="font-serif font-bold text-lg text-[#081827] flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={18} />
                Citation Inspector
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Deep-dive details of the verification references.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Citation selector cards */}
              <div className="space-y-2">
                {activeCitations.map((cit, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCitationClick(cit)}
                    className={`w-full text-left p-3.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      selectedCitation === cit
                        ? "bg-slate-50 border-[#081827] ring-1 ring-[#081827]"
                        : "bg-white border-gray-100 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold text-[#081827] truncate">
                        {cit.document}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Chunk Index {cit.chunk_index} • Conf: {(cit.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                ))}
              </div>

              {/* Display selected citation text snippet */}
              {selectedCitation && (
                <div className="rounded-xl border border-gray-100 bg-slate-50/50 p-4 mt-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Verified Passage Excerpt
                    </span>
                    <span className="text-[10px] font-mono bg-yellow-100 text-yellow-800 rounded px-1.5 py-0.5">
                      Conf: {(selectedCitation.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <blockquote className="text-xs leading-relaxed text-slate-600 font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    "{selectedCitation.snippet}"
                  </blockquote>
                </div>
              )}

            </div>
          </aside>
        )}

      </div>
    </div>
  );
}

export default Chat;
