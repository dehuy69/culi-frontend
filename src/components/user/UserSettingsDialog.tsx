import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { User, Key, Loader2, AlertCircle } from "lucide-react";
import type { UserInfo } from "@/lib/types";

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserSettingsDialog = ({ open, onOpenChange }: UserSettingsDialogProps) => {
  // User state
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Load user info when dialog opens
  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setUserInfo(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      setUserError(null);
      return;
    }

    let cancelled = false;

    const loadUserInfo = async () => {
      try {
        setIsLoadingUser(true);
        setUserError(null);
        const data = await apiClient.getCurrentUser();
        if (!cancelled) {
          setUserInfo(data);
        }
      } catch (error: any) {
        console.error("Error loading user info:", error);
        if (!cancelled) {
          setUserError(error.message || "Không thể tải thông tin người dùng");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUser(false);
        }
      }
    };

    loadUserInfo();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const validatePasswordForm = (): boolean => {
    const errors: typeof passwordErrors = {};

    if (!oldPassword.trim()) {
      errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!newPassword.trim()) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.changePassword(oldPassword, newPassword);
      toast({
        title: "Thành công",
        description: "Đã đổi mật khẩu thành công",
      });
      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đổi mật khẩu",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Cài đặt tài khoản
          </DialogTitle>
          <DialogDescription>Quản lý thông tin tài khoản và mật khẩu của bạn</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </CardTitle>
              <CardDescription>Thông tin tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingUser ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ) : userError ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{userError}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsLoadingUser(true);
                      setUserError(null);
                      apiClient
                        .getCurrentUser()
                        .then((data) => {
                          setUserInfo(data);
                        })
                        .catch((error: any) => {
                          setUserError(error.message || "Không thể tải thông tin người dùng");
                        })
                        .finally(() => setIsLoadingUser(false));
                    }}
                  >
                    Thử lại
                  </Button>
                </div>
              ) : userInfo ? (
                <>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input value={userInfo.username} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày tạo tài khoản</Label>
                    <Input value={formatDate(userInfo.created_at)} disabled />
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Separator />

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Đổi mật khẩu
              </CardTitle>
              <CardDescription>Cập nhật mật khẩu đăng nhập của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-password">Mật khẩu hiện tại</Label>
                <Input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (passwordErrors.oldPassword) {
                      setPasswordErrors({ ...passwordErrors, oldPassword: undefined });
                    }
                  }}
                  placeholder="Nhập mật khẩu hiện tại"
                  disabled={isChangingPassword}
                />
                {passwordErrors.oldPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.oldPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword) {
                      setPasswordErrors({ ...passwordErrors, newPassword: undefined });
                    }
                    // Clear confirm password error if passwords match
                    if (e.target.value === confirmPassword && passwordErrors.confirmPassword) {
                      setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
                    }
                  }}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  disabled={isChangingPassword}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                )}
                <p className="text-xs text-muted-foreground">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
                    }
                  }}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={isChangingPassword}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword ||
                  !oldPassword.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim()
                }
                className="gradient-primary"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang đổi mật khẩu...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Đổi mật khẩu
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsDialog;

