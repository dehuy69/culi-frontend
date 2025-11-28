import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Settings, Link2, ChevronDown, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storage } from "@/lib/localStorage";
import { apiClient } from "@/lib/api";
import type { Workspace } from "@/lib/types";

interface WorkspaceSidebarProps {
  currentWorkspaceId?: string;
}

const WorkspaceSidebar = ({ currentWorkspaceId }: WorkspaceSidebarProps) => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (currentWorkspaceId && workspaces.length > 0) {
      const workspaceId = parseInt(currentWorkspaceId);
      const current = workspaces.find((w) => w.id === workspaceId);
      setCurrentWorkspace(current || null);
    }
  }, [currentWorkspaceId, workspaces]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.listWorkspaces();
      setWorkspaces(data);
    } catch (error: any) {
      console.error("Error loading workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.setToken(null);
    storage.clearAuth();
    navigate("/");
  };

  const getWorkspaceIcon = (workspace: Workspace) => {
    // For now, use a default icon. Can be enhanced to support custom icons
    return "🏪";
  };

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="text-lg font-bold gradient-text">Culi</span>
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="p-3 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between" disabled={isLoading}>
              <div className="flex items-center gap-2 min-w-0">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-lg">
                    {currentWorkspace ? getWorkspaceIcon(currentWorkspace) : "🏪"}
                  </span>
                )}
                <span className="truncate text-sm">
                  {isLoading
                    ? "Đang tải..."
                    : currentWorkspace?.name || "Chọn workspace"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {isLoading ? (
              <DropdownMenuItem disabled>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải...
              </DropdownMenuItem>
            ) : (
              <>
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => navigate(`/workspace/${ws.id}`)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{getWorkspaceIcon(ws)}</span>
                    <span className="truncate">{ws.name}</span>
                  </DropdownMenuItem>
                ))}
                <Separator className="my-1" />
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                  <Home className="w-4 h-4 mr-2" />
                  Tất cả workspaces
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate(`/workspace/${currentWorkspaceId}/settings`)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate(`/workspace/${currentWorkspaceId}/connections`)}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Kết nối ứng dụng
          </Button>
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-medium">
            {storage.getCurrentUser()?.name[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{storage.getCurrentUser()?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{storage.getCurrentUser()?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default WorkspaceSidebar;
