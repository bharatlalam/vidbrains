import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AuthModal({ onClose, onSuccess }) {
  const { sendOTP, verifyOTP, completeSignup, loginWithToken } = useAuth();
  const [step, setStep] = useState("email"); // email | otp | name
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  function startResendTimer() {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  async function handleSendOTP() {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendOTP(email.trim());
      setStep("otp");
      startResendTimer();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await verifyOTP(email.trim(), otp.trim());
      if (result.isNewUser) {
        setStep("name");
      } else {
        loginWithToken(result.token, result.user);
        onSuccess(result.user);
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Incorrect OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteName() {
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your name (at least 2 characters)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await completeSignup(email.trim(), name.trim());
      onSuccess(user);
    } catch (e) {
      setError(e?.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl p-6 animate-fade-in"
        style={{ background: "#131316", border: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: "#e05a2b" }}>🧠</div>
            <span className="font-black text-base">VidBrain</span>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: "#5a5958", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          {["email", "otp", "name"].map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 99,
              background: ["email", "otp", "name"].indexOf(step) >= i ? "#e05a2b" : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* STEP 1 — Email */}
        {step === "email" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-black mb-1" style={{ letterSpacing: "-0.5px" }}>Sign in to VidBrain</h2>
            <p className="text-sm mb-6" style={{ color: "#9b9a96" }}>
              Enter your email — we'll send you a one-time code
            </p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
              placeholder="your@email.com"
              type="email"
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
              onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            {error && <p className="text-xs mb-3" style={{ color: "#e05a2b" }}>{error}</p>}
            <button onClick={handleSendOTP} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "#e05a2b", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Sending..." : "Send OTP →"}
            </button>
            <p className="text-xs text-center mt-3" style={{ color: "#5a5958" }}>
              No password needed · Works on any device
            </p>
          </div>
        )}

        {/* STEP 2 — OTP */}
        {step === "otp" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-black mb-1" style={{ letterSpacing: "-0.5px" }}>Enter your code</h2>
            <p className="text-sm mb-1" style={{ color: "#9b9a96" }}>
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-bold mb-6" style={{ color: "#e05a2b" }}>{email}</p>

            {/* OTP input */}
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
              placeholder="000000"
              type="text"
              maxLength={6}
              autoFocus
              className="w-full rounded-xl px-4 py-4 text-center text-2xl font-black outline-none mb-3 tracking-widest"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8", fontFamily: "'DM Mono', monospace", letterSpacing: "0.4em" }}
              onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />

            {error && <p className="text-xs mb-3" style={{ color: "#e05a2b" }}>{error}</p>}

            <button onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-xl text-sm font-bold text-white mb-3"
              style={{ background: "#e05a2b", border: "none", cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer", opacity: loading || otp.length !== 6 ? 0.5 : 1 }}>
              {loading ? "Verifying..." : "Verify OTP →"}
            </button>

            <div className="flex items-center justify-between">
              <button onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                style={{ background: "none", border: "none", color: "#9b9a96", cursor: "pointer", fontSize: 13 }}>
                ← Change email
              </button>
              <button onClick={() => { handleSendOTP(); setOtp(""); }} disabled={resendTimer > 0}
                style={{ background: "none", border: "none", color: resendTimer > 0 ? "#5a5958" : "#e05a2b", cursor: resendTimer > 0 ? "not-allowed" : "pointer", fontSize: 13 }}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Name (new users only) */}
        {step === "name" && (
          <div className="animate-fade-in">
            <div style={{ fontSize: 40, marginBottom: 12, textAlign: "center" }}>👋</div>
            <h2 className="text-xl font-black mb-1 text-center" style={{ letterSpacing: "-0.5px" }}>Welcome to VidBrain!</h2>
            <p className="text-sm mb-6 text-center" style={{ color: "#9b9a96" }}>
              What should we call you?
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCompleteName()}
              placeholder="Your name"
              type="text"
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
              style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.07)", color: "#f0efe8" }}
              onFocus={(e) => e.target.style.borderColor = "#e05a2b"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"} />
            {error && <p className="text-xs mb-3" style={{ color: "#e05a2b" }}>{error}</p>}
            <button onClick={handleCompleteName} disabled={loading || name.trim().length < 2}
              className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "#e05a2b", border: "none", cursor: loading || name.trim().length < 2 ? "not-allowed" : "pointer", opacity: loading || name.trim().length < 2 ? 0.5 : 1 }}>
              {loading ? "Setting up..." : "Let's Go 🚀"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}