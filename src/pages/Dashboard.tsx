import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, MessageSquare, LogOut, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storage } from "@/lib/localStorage";
import { apiClient } from "@/lib/api";
import type { Workspace } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(storage.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check auth
    if (!storage.getAuth()) {
      navigate("/auth");
      return;
    }

    // Load workspaces from API
    loadWorkspaces();
  }, [navigate]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.listWorkspaces();
      setWorkspaces(data);
    } catch (error: any) {
      console.error("Error loading workspaces:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách workspaces. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.setToken(null);
    storage.clearAuth();
    toast({ title: "Đã đăng xuất" });
    navigate("/");
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên workspace",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const workspace = await apiClient.createWorkspace({ name: newWorkspaceName.trim() });
      setWorkspaces([...workspaces, workspace]);
      setNewWorkspaceName("");
      setShowCreateDialog(false);
      toast({ title: "Đã tạo workspace mới" });
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo workspace. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteWorkspace(workspaceToDelete.id);
      setWorkspaces(workspaces.filter((w) => w.id !== workspaceToDelete.id));
      setWorkspaceToDelete(null);
      toast({ title: "Đã xóa workspace" });
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa workspace. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredWorkspaces = workspaces.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to get workspace icon (can be enhanced later)
  const getWorkspaceIcon = (workspace: Workspace) => {
    // For now, use a default icon. Can be enhanced to support custom icons
    return "🏪";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <WorkspaceSidebar />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-subtle">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
          {/* Title & Search */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Workspaces của bạn</h1>
            <p className="text-muted-foreground mb-4">
              Quản lý các hộ kinh doanh trong các workspace riêng biệt
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm workspace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo workspace
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo workspace mới</DialogTitle>
                    <DialogDescription>
                      Nhập tên cho workspace mới của bạn
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      placeholder="Tên workspace"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isCreating) {
                          handleCreateWorkspace();
                        }
                      }}
                      disabled={isCreating}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={isCreating}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleCreateWorkspace}
                      disabled={isCreating || !newWorkspaceName.trim()}
                      className="gradient-primary"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tạo...
                        </>
                      ) : (
                        "Tạo"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Workspace Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkspaces.map((workspace, index) => (
                  <Card
                    key={workspace.id}
                    className="hover:shadow-lg transition-all hover:-translate-y-1 animate-scale-in group relative"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{getWorkspaceIcon(workspace)}</div>
                        <div className="flex-1 min-w-0">
                          <CardTitle
                            className="text-lg truncate cursor-pointer"
                            onClick={() => navigate(`/workspace/${workspace.id}`)}
                          >
                            {workspace.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Tạo ngày {formatDate(workspace.created_at)}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceToDelete(workspace);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
                        onClick={() => navigate(`/workspace/${workspace.id}`)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Mở workspace</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredWorkspaces.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Không tìm thấy workspace nào"
                      : "Bạn chưa có workspace nào"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowCreateDialog(true)} className="gradient-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo workspace đầu tiên
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={workspaceToDelete !== null}
            onOpenChange={(open) => !open && setWorkspaceToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa workspace</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa workspace "{workspaceToDelete?.name}"? Hành động này
                  không thể hoàn tác.
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
