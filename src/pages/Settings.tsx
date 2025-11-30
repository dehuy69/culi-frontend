import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Trash2, Settings as SettingsIcon, Loader2, AlertCircle, Menu } from "lucide-react";
import type { Workspace } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Memoize workspaceId to prevent recalculation
  const workspaceId = useMemo(() => {
    if (!params.id) return null;
    const parsed = parseInt(params.id, 10);
    return isNaN(parsed) ? null : parsed;
  }, [params.id]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Workspace state
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  // Delete workspace state
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load workspace - only run once when workspaceId changes
  useEffect(() => {
    if (!workspaceId) {
      setIsLoadingWorkspace(false);
      setWorkspaceError("Workspace ID không hợp lệ");
      return;
    }

    let cancelled = false;

    const loadWorkspace = async () => {
      try {
        setIsLoadingWorkspace(true);
        setWorkspaceError(null);
        const data = await apiClient.getWorkspace(workspaceId);
        if (!cancelled) {
          setWorkspace(data);
          setWorkspaceName(data.name);
        }
      } catch (error: any) {
        console.error("Error loading workspace:", error);
        if (!cancelled) {
          setWorkspaceError(error.message || "Không thể tải thông tin workspace");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingWorkspace(false);
        }
      }
    };

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleSaveWorkspace = async () => {
    if (!workspaceId || !workspaceName.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên workspace không được để trống",
        variant: "destructive",
      });
      return;
    }

    if (workspaceName.trim().length > 200) {
      toast({
        title: "Lỗi",
        description: "Tên workspace không được vượt quá 200 ký tự",
        variant: "destructive",
      });
      return;
    }

    setIsSavingWorkspace(true);
    try {
      const updated = await apiClient.updateWorkspace(workspaceId, {
        name: workspaceName.trim(),
      });
      setWorkspace(updated);
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin workspace",
      });
    } catch (error: any) {
      console.error("Error updating workspace:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật workspace",
        variant: "destructive",
      });
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId || !workspaceToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteWorkspace(workspaceId);
      toast({ title: "Đã xóa workspace" });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa workspace",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setWorkspaceToDelete(null);
    }
  };

  // Early return if no workspace ID
  if (!workspaceId) {
    return (
      <div className="h-screen flex bg-background">
        <WorkspaceSidebar 
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
        {isMobile && (
          <div className="md:hidden border-b border-border p-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">Cài đặt</h1>
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <div className={cn("mx-auto", isMobile ? "max-w-full px-3 py-4" : "container max-w-4xl p-6")}>
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Lỗi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Không tìm thấy workspace ID. Vui lòng chọn một workspace từ dashboard.
                </p>
                <Button onClick={() => navigate("/dashboard")} className="gradient-primary">
                  Quay về Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state immediately to prevent freeze
  if (isLoadingWorkspace && !workspace && !workspaceError) {
    return (
      <div className="h-screen flex bg-background">
        <WorkspaceSidebar 
          currentWorkspaceId={params.id}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {isMobile && (
            <div className="md:hidden border-b border-border p-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="font-semibold">Cài đặt</h1>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <div className={cn("mx-auto", isMobile ? "max-w-full px-3 py-4" : "container max-w-4xl p-6")}>
              <div className={cn("mb-6", isMobile && "mb-4")}>
                <h1 className={cn("font-bold mb-2 flex items-center gap-2", isMobile ? "text-2xl" : "text-3xl")}>
                  <SettingsIcon className={cn(isMobile ? "w-6 h-6" : "w-8 h-8")} />
                  Cài đặt Workspace
                </h1>
                <p className={cn("text-muted-foreground", isMobile && "text-sm")}>Quản lý cài đặt cho workspace này</p>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                      <div className="h-10 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-10 bg-muted rounded w-32 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      <WorkspaceSidebar 
        currentWorkspaceId={params.id}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {isMobile && (
          <div className="md:hidden border-b border-border p-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">Cài đặt</h1>
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <div className={cn("mx-auto", isMobile ? "max-w-full px-3 py-4" : "container max-w-4xl p-6")}>
            <div className={cn("mb-6", isMobile && "mb-4")}>
              <h1 className={cn("font-bold mb-2 flex items-center gap-2", isMobile ? "text-2xl" : "text-3xl")}>
                <SettingsIcon className={cn(isMobile ? "w-6 h-6" : "w-8 h-8")} />
                Cài đặt Workspace
              </h1>
              <p className={cn("text-muted-foreground", isMobile && "text-sm")}>Quản lý cài đặt cho workspace này</p>
            </div>

          <div className="space-y-4">
            {/* Workspace Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Thông tin Workspace
                </CardTitle>
                <CardDescription>Cập nhật tên workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingWorkspace ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                      <div className="h-10 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-10 bg-muted rounded w-32 animate-pulse" />
                  </div>
                ) : workspaceError ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{workspaceError}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (workspaceId) {
                          setIsLoadingWorkspace(true);
                          setWorkspaceError(null);
                          apiClient
                            .getWorkspace(workspaceId)
                            .then((data) => {
                              setWorkspace(data);
                              setWorkspaceName(data.name);
                            })
                            .catch((error: any) => {
                              setWorkspaceError(error.message || "Không thể tải workspace");
                            })
                            .finally(() => setIsLoadingWorkspace(false));
                        }
                      }}
                    >
                      Thử lại
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="workspace-name">Tên workspace</Label>
                      <Input
                        id="workspace-name"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="Tên workspace"
                        disabled={isSavingWorkspace}
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground">
                        {workspaceName.length}/200 ký tự
                      </p>
                    </div>
                    <Button
                      onClick={handleSaveWorkspace}
                      disabled={isSavingWorkspace || !workspaceName.trim()}
                      className="gradient-primary"
                    >
                      {isSavingWorkspace ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Vùng nguy hiểm
                </CardTitle>
                <CardDescription>Xóa workspace này vĩnh viễn</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog
                  open={workspaceToDelete !== null}
                  onOpenChange={(open) => !open && setWorkspaceToDelete(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => workspace && setWorkspaceToDelete(workspace)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Tất cả dữ liệu trong workspace "
                        {workspaceToDelete?.name}" sẽ bị xóa vĩnh viễn, bao gồm:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Tất cả cuộc hội thoại và tin nhắn</li>
                          <li>Tất cả kết nối ứng dụng</li>
                          <li>Các cài đặt và cấu hình</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteWorkspace}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang xóa...
                          </>
                        ) : (
                          "Xóa"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
