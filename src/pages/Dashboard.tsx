import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, MessageSquare, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { storage } from "@/lib/localStorage";
import { mockWorkspaces } from "@/lib/mockData";
import { Workspace } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(storage.getCurrentUser());

  useEffect(() => {
    // Check auth
    if (!storage.getAuth()) {
      navigate("/auth");
      return;
    }

    // Load or initialize workspaces
    let savedWorkspaces = storage.getWorkspaces();
    if (savedWorkspaces.length === 0) {
      storage.setWorkspaces(mockWorkspaces);
      savedWorkspaces = mockWorkspaces;
    }
    setWorkspaces(savedWorkspaces);
  }, [navigate]);

  const handleLogout = () => {
    storage.clearAuth();
    toast({ title: "Đã đăng xuất" });
    navigate("/");
  };

  const handleCreateWorkspace = () => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: `Workspace mới ${workspaces.length + 1}`,
      icon: "🏪",
      createdAt: new Date().toISOString().split("T")[0],
      messageCount: 0,
    };
    storage.addWorkspace(newWorkspace);
    setWorkspaces([...workspaces, newWorkspace]);
    toast({ title: "Đã tạo workspace mới" });
  };

  const filteredWorkspaces = workspaces.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <span className="text-xl font-bold gradient-text">Culi</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
              <Button onClick={handleCreateWorkspace} className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Tạo workspace
              </Button>
            </div>
          </div>

          {/* Workspace Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkspaces.map((workspace, index) => (
              <Card
                key={workspace.id}
                className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/workspace/${workspace.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{workspace.icon}</div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{workspace.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Tạo ngày {new Date(workspace.createdAt).toLocaleDateString("vi-VN")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span>{workspace.messageCount} tin nhắn</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy workspace nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
