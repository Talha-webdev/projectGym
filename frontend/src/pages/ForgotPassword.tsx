import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/services/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMessage("");
    try {
      await authApi.forgotPassword(email.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send reset email. Please try again.");
    }
  };

  return (
    <>
      <SEOHead title="Forgot Password" robots="noindex" canonical="/forgot-password" />
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
                <Mail className="h-8 w-8 text-gym-gold" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Forgot Password</h1>
              <p className="mt-2 text-sm text-gym-text-secondary">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <Card hover={false} className="p-6">
              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gym-success/10">
                    <CheckCircle className="h-7 w-7 text-gym-success" />
                  </div>
                  <p className="text-sm font-medium text-gym-text-primary">Check your email</p>
                  <p className="mt-2 text-sm text-gym-text-secondary">
                    We've sent a password reset link to <strong className="text-gym-text-primary">{email}</strong>.
                    The link expires in 1 hour.
                  </p>
                  <p className="mt-1 text-xs text-gym-text-muted">Didn't receive it? Check your spam folder.</p>
                  <div className="mt-6 space-y-2">
                    <Link to="/login">
                      <Button variant="outline" className="w-full">
                        <ArrowLeft className="h-4 w-4" /> Back to Login
                      </Button>
                    </Link>
                    <button onClick={() => setStatus("idle")} className="text-sm text-gym-gold hover:underline">
                      Try a different email
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-gym-error"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {errorMessage}
                    </motion.div>
                  )}
                  <Button type="submit" isLoading={status === "sending"} className="w-full">
                    Send Reset Link <ArrowRight className="h-4 w-4" />
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
