import React, { useState, useEffect, useContext, useRef } from "react";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import { api } from "../services/api";
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  MessageSquare, 
  FileText,
  AlertCircle,
  PlusCircle
} from "lucide-react";
import { Link } from "react-router-dom";

function Chat() {
  const { documents, fetchDocuments, token } = useContext(AppContext);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCitations, setActiveCitations] = useState([]);
  const [selectedCitation, setSelectedCitation] = useState(null);

  const messagesEndRef = useRef(null);

  const fetchChatHistory = async () => {
    try {
      const res = await api.getChatHistory();
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDocuments();
      fetchChatHistory();
    }
  }, [token]);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userQuery = prompt;
    setPrompt("");
    setLoading(true);

    // Append user message
    setMessages((prev) => [...prev, { sender: "user", text: userQuery }]);

    try {
      const response = await api.sendChatMessage(userQuery);
      
      // Append AI message
      setMessages((prev) => [
        ...prev, 
        { 
          sender: "ai", 
          text: response.answer, 
          citations: response.citations 
        }
      ]);

      // Set current citations to show on the right panel
      if (response.citations && response.citations.length > 0) {
        setActiveCitations(response.citations);
        setSelectedCitation(response.citations[0]); // Select first by default
      } else {
        setActiveCitations([]);
        setSelectedCitation(null);
      }

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

  const handleNewChat = async () => {
    try {
      await api.clearChatHistory();
    } catch (err) {
      console.error("Failed to clear chat history on server:", err);
    }
    setMessages([]);
    setActiveCitations([]);
    setSelectedCitation(null);
  };

  return (
    <div className="flex h-screen flex-col bg-[#F4F5FA] text-[#081827] overflow-hidden">
      <Navbar />

      {/* Main Workspace */}
      <div className="flex flex-1 pt-20 overflow-hidden">
        
        {/* Left Panel: Library & Control */}
        <aside className="hidden w-[280px] flex-col border-r border-gray-200 bg-white p-6 lg:flex">
          
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#081827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black cursor-pointer mb-6"
          >
            <PlusCircle size={16} />
            Start New Consultation
          </button>

          <div className="flex-1 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>Active Knowledge Base</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600 font-mono">
                {documents.length}
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-400">
                <p className="text-xs">No active resources indexed.</p>
                <Link
                  to="/upload"
                  className="mt-3 inline-block text-xs font-semibold text-blue-700 hover:underline"
                >
                  Upload documents &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.doc_id}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition"
                  >
                    <FileText size={16} className="text-slate-400 shrink-0" />
                    <span 
                      className="truncate text-xs font-medium text-slate-700" 
                      title={doc.filename}
                    >
                      {doc.filename}
                    </span>
                  </div>
                ))}
                
                <Link
                  to="/upload"
                  className="mt-4 block text-center text-xs font-semibold text-blue-700 hover:underline"
                >
                  Manage Library &rarr;
                </Link>
              </div>
            )}
          </div>
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
                      <p>
                        <strong>Note:</strong> You haven't uploaded any documents yet. Please <Link to="/upload" className="font-semibold underline">upload a PDF</Link> to query.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    
                    {msg.sender === "ai" && (
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-serif text-xs font-bold">
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
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
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
          <aside className="hidden w-[340px] flex-col border-l border-gray-200 bg-white xl:flex overflow-hidden">
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
