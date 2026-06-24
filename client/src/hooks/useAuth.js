import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://vidbrain-server.onrender.com/api",
  timeout: 30000,
});

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vb_token");
    if (token) {
      api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem("vb_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const sendOTP = useCallback(async (email) => {
    const { data } = await api.post("/auth/send-otp", { email });
    return data;
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    return data;
  }, []);

  const completeSignup = useCallback(async (email, name) => {
    const { data } = await api.post("/auth/complete-signup", { email, name });
    localStorage.setItem("vb_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithToken = useCallback((token, userData) => {
    localStorage.setItem("vb_token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("vb_token");
    setUser(null);
  }, []);

  function getToken() {
    return localStorage.getItem("vb_token");
  }

  return { user, loading, sendOTP, verifyOTP, completeSignup, loginWithToken, logout, getToken };
}