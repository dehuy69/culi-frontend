import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Home, Settings, Link2, ChevronDown, LogOut, Loader2, MessageSquare, User } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { storage } from "@/lib/localStorage";
import { apiClient } from "@/lib/api";
import type { Workspace } from "@/lib/types";
import UserSettingsDialog from "@/components/user/UserSettingsDialog";
import Logo from "@/components/Logo";

interface WorkspaceSidebarProps {
  currentWorkspaceId?: string;
}

const WorkspaceSidebar = ({ currentWorkspaceId: propWorkspaceId }: WorkspaceSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  
  // Get workspace ID from prop or URL params
  const currentWorkspaceId = propWorkspaceId || params.id;
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserSettings, setShowUserSettings] = useState(false);
  
  // Check if current route is chat page
  const isChatPage = currentWorkspaceId && location.pathname === `/workspace/${currentWorkspaceId}`;
  const isSettingsPage = currentWorkspaceId && location.pathname === `/workspace/${currentWorkspaceId}/settings`;
  const isConnectionsPage = currentWorkspaceId && location.pathname === `/workspace/${currentWorkspaceId}/connections`;

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
        <Logo size="md" showText={true} />
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
          {currentWorkspaceId && (
            <Button
              variant={isChatPage ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(`/workspace/${currentWorkspaceId}`)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
          )}
          {currentWorkspaceId && (
            <Button
              variant={isSettingsPage ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(`/workspace/${currentWorkspaceId}/settings`)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </Button>
          )}
          {currentWorkspaceId && (
            <Button
              variant={isConnectionsPage ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(`/workspace/${currentWorkspaceId}/connections`)}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Kết nối ứng dụng
            </Button>
          )}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2 mb-2 p-2 rounded-md hover:bg-accent transition-colors">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {storage.getCurrentUser()?.name[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{storage.getCurrentUser()?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{storage.getCurrentUser()?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setShowUserSettings(true)}>
              <User className="w-4 h-4 mr-2" />
              Cài đặt tài khoản
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Settings Dialog */}
      <UserSettingsDialog open={showUserSettings} onOpenChange={setShowUserSettings} />
    </div>
  );
};

export default WorkspaceSidebar;
