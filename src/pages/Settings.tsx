import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { storage } from "@/lib/localStorage";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
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
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(storage.getWorkspaces().find((w) => w.id === id));
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [workspaceIcon, setWorkspaceIcon] = useState(workspace?.icon || "");

  const handleSaveWorkspace = () => {
    if (!id) return;
    storage.updateWorkspace(id, { name: workspaceName, icon: workspaceIcon });
    toast({ title: "Đã lưu thay đổi" });
    setWorkspace(storage.getWorkspaces().find((w) => w.id === id));
  };

  const handleDeleteWorkspace = () => {
    if (!id) return;
    storage.deleteWorkspace(id);
    toast({ title: "Đã xóa workspace" });
    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex bg-background">
      <WorkspaceSidebar currentWorkspaceId={id} />
      
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Cài đặt</h1>
            <p className="text-muted-foreground">Quản lý cài đặt workspace và tài khoản</p>
          </div>

          <Tabs defaultValue="workspace">
            <TabsList className="mb-6">
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
            </TabsList>

            <TabsContent value="workspace" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin Workspace</CardTitle>
                  <CardDescription>Cập nhật tên và icon của workspace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Tên workspace</Label>
                    <Input
                      id="workspace-name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="Tên workspace"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspace-icon">Icon (emoji)</Label>
                    <Input
                      id="workspace-icon"
                      value={workspaceIcon}
                      onChange={(e) => setWorkspaceIcon(e.target.value)}
                      placeholder="🏪"
                      maxLength={2}
                    />
                  </div>
                  <Button onClick={handleSaveWorkspace} className="gradient-primary">
                    Lưu thay đổi
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Vùng nguy hiểm</CardTitle>
                  <CardDescription>Xóa workspace này vĩnh viễn</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Xóa workspace
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể hoàn tác. Tất cả dữ liệu trong workspace sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteWorkspace} className="bg-destructive">
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>Thông tin tài khoản của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={storage.getCurrentUser()?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Tên</Label>
                    <Input value={storage.getCurrentUser()?.name || ""} disabled />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Đây là mock UI. Trong phiên bản thật, bạn có thể cập nhật thông tin này.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
