const API_BASE_URL = "http://127.0.0.1:8000";


const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  async register(fullName, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Registration failed");
    return data;
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");
    return data;
  },

  // Documents
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Upload failed");
    return data;
  },

  async getDocuments() {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to fetch documents");
    return data;
  },

  async deleteDocument(docId) {
    const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to delete document");
    return data;
  },

  // Chat
  async sendChatMessage(prompt) {
    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to send chat message");
    return data;
  },

  // Summary
  async getDocumentSummary(docId) {
    const response = await fetch(`${API_BASE_URL}/summary/${docId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to fetch summary");
    return data;
  },

  // Chat History
  async getChatHistory() {
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to fetch chat history");
    return data;
  },

  async clearChatHistory() {
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to clear chat history");
    return data;
  },
};
