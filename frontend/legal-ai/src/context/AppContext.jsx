import React, { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const loginUser = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const registerUser = async (fullName, email, password) => {
    const data = await api.register(fullName, email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        documents,
        loadingDocs,
        loginUser,
        registerUser,
        logoutUser,
        fetchDocuments,
        setDocuments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
