import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Crown,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Save,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useAuth } from "@/store/AuthContext";
import { useMembership } from "@/hooks/useMembership";
import { authApi } from "@/services/authApi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatDateShort } from "@/utils/formatters";
import { fadeInUp, staggerContainer } from "@/utils/animations";

export default function Profile() {
  const { user, setUser } = useAuth();
  const { data: membership } = useMembership();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isActive = membership?.is_active ?? false;

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    setSaveError(null);
    if (!fullName.trim()) return;
    setIsSaving(true);
    try {
      const { data } = await authApi.updateProfile({ full_name: fullName.trim() });
      setUser(data);
      setSaveMessage("Profile updated successfully.");
    } catch {
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!currentPassword) { setPasswordError("Current password is required."); return; }
    if (newPassword.length < 8) { setPasswordError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Failed to change password. Check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <SEOHead title="Profile" robots="noindex" canonical="/profile" />
      <div className="section-padding">
        <div className="content-max-width px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Profile</h1>
            <p className="mt-1 text-sm text-gym-text-secondary">Manage your account settings.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-6 lg:grid-cols-3"
          >
            <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
              <Card hover={false} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-gym-gold" />
                  <h2 className="font-heading text-lg font-bold text-gym-text-primary">Account Information</h2>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <Avatar src={user?.avatar_url || undefined} alt={user?.full_name || "User"} size="lg" />
                  <div>
                    <p className="text-sm font-medium text-gym-text-primary">{user?.full_name}</p>
                    <p className="text-xs text-gym-text-muted">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {user?.is_verified ? (
                        <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1"><XCircle className="h-3 w-3" /> Unverified</Badge>
                      )}
                      {user?.is_admin && <Badge variant="premium" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="opacity-60"
                  />
                  {saveMessage && <p className="text-sm text-gym-success">{saveMessage}</p>}
                  {saveError && <p className="text-sm text-gym-error">{saveError}</p>}
                  <Button type="submit" isLoading={isSaving} size="sm">
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </form>
              </Card>

              <Card hover={false} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="h-5 w-5 text-gym-gold" />
                  <h2 className="font-heading text-lg font-bold text-gym-text-primary">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {passwordSuccess && <p className="text-sm text-gym-success">{passwordSuccess}</p>}
                  {passwordError && <p className="text-sm text-gym-error">{passwordError}</p>}
                  <Button type="submit" isLoading={isChangingPassword} size="sm" variant="outline">
                    <Lock className="h-4 w-4" /> Change Password
                  </Button>
                </form>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-6">
              <Card hover={false} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="h-5 w-5 text-gym-gold" />
                  <h2 className="font-heading text-lg font-bold text-gym-text-primary">Membership</h2>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gym-text-secondary">Status</span>
                  <Badge variant={isActive ? "premium" : "default"}>
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {isActive ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gym-text-secondary flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Started</span>
                      <span className="font-medium text-gym-text-primary">{membership?.start_date ? formatDateShort(membership.start_date) : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gym-text-secondary flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Expires</span>
                      <span className="font-medium text-gym-text-primary">{membership?.end_date ? formatDateShort(membership.end_date) : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gym-text-secondary flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Days Left</span>
                      <span className="font-heading text-xl font-bold text-gym-gold">{membership?.days_remaining ?? 0}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gym-elevated mt-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gym-gold/60 to-gym-gold transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, ((membership?.days_remaining ?? 0) / 90) * 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-gym-text-muted">{membership?.days_remaining ?? 0} of 90 days remaining</p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-gym-elevated/50 p-4 text-center mt-2">
                    <Sparkles className="mx-auto h-6 w-6 text-gym-text-muted" />
                    <p className="mt-2 text-sm text-gym-text-secondary">No active membership.</p>
                    <Link to="/pricing" className="mt-3 inline-block">
                      <Button size="sm"><Crown className="mr-1.5 h-4 w-4" /> Get Membership</Button>
                    </Link>
                  </div>
                )}
              </Card>

              <Card hover={false} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-5 w-5 text-gym-gold" />
                  <h2 className="font-heading text-lg font-bold text-gym-text-primary">Account Details</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gym-text-secondary">Role</span>
                    <span className="font-medium text-gym-text-primary">{user?.is_admin ? "Admin" : "Member"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gym-text-secondary">Email Verified</span>
                    <span className={`font-medium ${user?.is_verified ? "text-gym-success" : "text-gym-warning"}`}>
                      {user?.is_verified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gym-text-secondary">Joined</span>
                    <span className="font-medium text-gym-text-primary">{user?.created_at ? formatDate(user.created_at) : "—"}</span>
                  </div>
                </div>
                {!user?.is_verified && (
                  <Link to="/dashboard" className="mt-4 flex items-center gap-1 text-xs text-gym-gold hover:underline">
                    Go to Dashboard <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
