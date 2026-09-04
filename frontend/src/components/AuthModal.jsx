import { useState } from "react";
import {
  Lock,
  Mail,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  api,
}) {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [projectId, setProjectId] = useState("");

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState("request"); // request | reset

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirmPassword("");
    setProjectId("");
    setForgotEmail("");
    setResetToken("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
    setSuccessMessage("");
    setForgotStep("request");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { token } = await api.verifyAccess(email.trim(), password.trim());
      setSuccessMessage("Login successful!");
      setTimeout(() => {
        resetForm();
        onSuccess(token);
        setMode("login");
        onClose();
      }, 500);
    } catch (err) {
      setError(
        err?.response?.status === 401
          ? "Incorrect email or password."
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword.trim() || !projectId.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await api.registerUser(
        regEmail.trim(),
        regPassword,
        projectId.trim()
      );
      setSuccessMessage(result.message);
      setTimeout(() => {
        setMode("login");
        setEmail(regEmail);
        setPassword("");
        setRegEmail("");
        setRegPassword("");
        setRegConfirmPassword("");
        setProjectId("");
        setSuccessMessage("");
      }, 500);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError("Please enter your email.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await api.forgotPassword(forgotEmail.trim());
      if (result.reset_token) {
        setResetToken(result.reset_token);
        setForgotStep("reset");
        setSuccessMessage("Reset token received. Enter your new password.");
      } else {
        setSuccessMessage(result.message);
      }
    } catch (err) {
      setError("Password recovery request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword.trim()) {
      setError("Please enter all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await api.resetPassword(resetToken, newPassword);
      setSuccessMessage(result.message);
      setTimeout(() => {
        resetForm();
        onSuccess(result.token);
        setMode("login");
        onClose();
      }, 500);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Password reset failed. Token may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative">
        <button
          onClick={() => {
            resetForm();
            onClose();
            setMode("login");
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Login Mode */}
        {mode === "login" && (
          <>
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-navy-900/5 flex items-center justify-center">
                <Lock className="h-6 w-6 text-navy-700" strokeWidth={2} />
              </div>
              <h2 className="font-display font-black text-lg text-navy-900">
                Login
              </h2>
              <p className="text-xs text-slate-500 text-center">
                Enter your credentials to access data uploads
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-alert-600 font-medium">{error}</p>
              )}
              {successMessage && (
                <p className="text-xs text-success-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-900 hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Logging in…" : "Login"}
              </button>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="w-full text-sm text-navy-700 hover:text-navy-900 font-semibold"
                >
                  New here? Create an account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="w-full text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          </>
        )}

        {/* Register Mode */}
        {mode === "register" && (
          <>
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-success-500/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-success-600" strokeWidth={2} />
              </div>
              <h2 className="font-display font-black text-lg text-navy-900">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 text-center">
                Sign up to start uploading project data
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="e.g. SIH26103"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                />
              </div>

              {error && (
                <p className="text-xs text-alert-600 font-medium">{error}</p>
              )}
              {successMessage && (
                <p className="text-xs text-success-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-success-600 hover:bg-success-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Creating…" : "Create Account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMessage("");
                }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Already have an account? Login
              </button>
            </form>
          </>
        )}

        {/* Forgot Password Mode */}
        {mode === "forgot" && (
          <>
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-full bg-saffron-500/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-saffron-600" strokeWidth={2} />
              </div>
              <h2 className="font-display font-black text-lg text-navy-900">
                Reset Password
              </h2>
              <p className="text-xs text-slate-500 text-center">
                {forgotStep === "request"
                  ? "Enter your email to get a reset token"
                  : "Enter your new password"}
              </p>
            </div>

            <form
              onSubmit={
                forgotStep === "request"
                  ? handleForgotRequest
                  : handleResetPassword
              }
              className="space-y-3"
            >
              {forgotStep === "request" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Reset Token
                    </label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste your reset token"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30"
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-xs text-alert-600 font-medium">{error}</p>
              )}
              {successMessage && (
                <p className="text-xs text-success-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-saffron-600 hover:bg-saffron-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading
                  ? forgotStep === "request"
                    ? "Sending…"
                    : "Resetting…"
                  : forgotStep === "request"
                  ? "Send Reset Link"
                  : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMessage("");
                  setForgotStep("request");
                }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Back to login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
