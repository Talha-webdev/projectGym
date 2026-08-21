import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/services/authApi";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  if (!token) {
    return (
      <>
        <SEOHead title="Reset Password" robots="noindex" canonical="/reset-password" />
        <div className="section-padding flex min-h-[60vh] items-center justify-center">
          <div className="content-max-width px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-md text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gym-error/10">
                <AlertCircle className="h-8 w-8 text-gym-error" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Invalid Reset Link</h1>
              <p className="mt-3 text-gym-text-secondary">This password reset link is invalid or missing a token.</p>
              <div className="mt-8 space-y-3">
                <Link to="/forgot-password">
                  <Button>Request New Reset Link</Button>
                </Link>
                <div>
                  <Link to="/login" className="text-sm text-gym-text-muted transition-colors hover:text-gym-gold">
                    <ArrowLeft className="inline h-3.5 w-3.5" /> Back to Login
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setStatus("submitting");
    try {
      await authApi.resetPassword(token, password);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Failed to reset password. The link may have expired.");
    }
  };

  return (
    <>
      <SEOHead title="Reset Password" robots="noindex" canonical="/reset-password" />
      <div className="section-padding flex min-h-[60vh] items-center justify-center">
        <div className="content-max-width px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-md"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gym-gold/10">
                <Lock className="h-8 w-8 text-gym-gold" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Reset Password</h1>
              <p className="mt-2 text-sm text-gym-text-secondary">Enter your new password below.</p>
            </div>

            <Card hover={false} className="p-6">
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gym-success/10">
                    <CheckCircle className="h-7 w-7 text-gym-success" />
                  </div>
                  <p className="text-sm font-medium text-gym-text-primary">Password Reset Successfully</p>
                  <p className="mt-2 text-sm text-gym-text-secondary">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                  <div className="mt-6">
                    <Link to="/login">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-gym-error"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}
                  <Button type="submit" isLoading={status === "submitting"} className="w-full">
                    Reset Password
                  </Button>
                </form>
              )}
            </Card>

            <p className="mt-6 text-center text-sm text-gym-text-secondary">
              <Link to="/login" className="flex items-center justify-center gap-1 font-medium text-gym-gold transition-colors hover:text-gym-gold-hover">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
