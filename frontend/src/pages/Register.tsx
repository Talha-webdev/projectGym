import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/AuthContext";
import { isValidEmail, isValidPassword } from "@/utils/validators";

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  general?: string;
}

const strengthColors: Record<string, string> = {
  weak: "bg-gym-error",
  medium: "bg-yellow-500",
  strong: "bg-green-500",
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordCheck = password ? isValidPassword(password) : null;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!fullName.trim()) newErrors.full_name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(email)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (!isValidPassword(password).valid) newErrors.password = "Password does not meet requirements";
    if (!confirmPassword) newErrors.confirm_password = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirm_password = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await register({ full_name: fullName, email, password });
      navigate("/check-email", { state: { email } });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const message =
        axiosErr?.response?.data?.detail || "Something went wrong. Please try again.";
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Create Account"
        description="Join LH Fitness today and start your fitness transformation. Sign up for free and get access to workout videos, blogs, and more."
        canonical="/register"
      />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-gym-border-light bg-gym-surface p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-bold text-gym-gold">Create Account</h1>
            <p className="mt-2 text-sm text-gym-text-secondary">
              Join the LH Fitness community
            </p>
          </div>

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-gym-error/30 bg-gym-error/10 px-4 py-3 text-sm text-gym-error"
            >
              {errors.general}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: undefined }));
              }}
              error={errors.full_name}
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                autoComplete="new-password"
              />
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {["weak", "medium", "strong"].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          ["weak", "medium", "strong"].indexOf(level) <=
                          ["weak", "medium", "strong"].indexOf(passwordCheck?.strength || "weak")
                            ? strengthColors[level]
                            : "bg-gym-border-light"
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="space-y-0.5">
                    {[
                      { label: "At least 8 characters", check: password.length >= 8 },
                      { label: "One uppercase letter", check: /[A-Z]/.test(password) },
                      { label: "One lowercase letter", check: /[a-z]/.test(password) },
                      { label: "One number", check: /[0-9]/.test(password) },
                    ].map(({ label, check }) => (
                      <li
                        key={label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          check ? "text-green-500" : "text-gym-text-muted"
                        }`}
                      >
                        <span className={`text-xs ${check ? "text-green-500" : "text-gym-text-muted"}`}>
                          {check ? "●" : "○"}
                        </span>
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirm_password) setErrors((prev) => ({ ...prev, confirm_password: undefined }));
              }}
              error={errors.confirm_password}
              autoComplete="new-password"
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? "Sending verification email..." : "Create Account"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gym-text-secondary">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-gym-gold transition-colors hover:text-gym-gold-hover">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
    </>
  );
}
