import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, Package, Store, Calculator, Box, Plus } from "lucide-react";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import AppConnectionCard from "@/components/workspace/AppConnectionCard";
import BrowseAppsDialog from "@/components/workspace/BrowseAppsDialog";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { SupportedApp, ConnectedApp, AppCategory, GroupedApps } from "@/lib/types";

const AppConnections = () => {
  const { id } = useParams();
  const [supportedApps, setSupportedApps] = useState<SupportedApp[]>([]);
  const [connections, setConnections] = useState<ConnectedApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBrowseDialogOpen, setIsBrowseDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const appCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Category labels - short names
  const categoryLabels: Record<AppCategory, string> = {
    POS_SIMPLE: "Quản lý bán hàng",
    ACCOUNTING: "Kế toán",
    UNKNOWN: "Khác",
  };

  // Category icons - using lucide-react icons
  const categoryIcons: Record<AppCategory, typeof Store> = {
    POS_SIMPLE: Store,
    ACCOUNTING: Calculator,
    UNKNOWN: Box,
  };

  // Load supported apps and connections
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const workspaceId = parseInt(id);
        const [apps, conns] = await Promise.all([
          apiClient.listSupportedApps(workspaceId),
          apiClient.listConnections(workspaceId),
        ]);
        setSupportedApps(apps);
        setConnections(conns);
      } catch (error: any) {
        console.error("Error loading data:", error);
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách apps và connections",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Group apps by category
  const groupAppsByCategory = (apps: SupportedApp[]): GroupedApps[] => {
    const grouped: Record<AppCategory, SupportedApp[]> = {
      POS_SIMPLE: [],
      ACCOUNTING: [],
      UNKNOWN: [],
    };

    apps.forEach((app) => {
      const category = app.category as AppCategory;
      if (grouped[category]) {
        grouped[category].push(app);
      } else {
        grouped.UNKNOWN.push(app);
      }
    });

    return Object.entries(grouped)
      .map(([category, apps]) => ({
        category: category as AppCategory,
        categoryLabel: categoryLabels[category as AppCategory],
        apps,
      }))
      .filter((group) => group.apps.length > 0);
  };

  // Filter apps by search query
  const filterApps = (apps: SupportedApp[]) => {
    if (!searchQuery.trim()) return apps;
    const query = searchQuery.toLowerCase();
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query)
    );
  };

  // Get connection for an app
  const getConnectionForApp = (appId: string): ConnectedApp | null => {
    return connections.find((conn) => conn.app_id === appId) || null;
  };

  // Handle connection change (refresh connections list)
  const handleConnectionChange = async () => {
    if (!id) return;
    try {
      const workspaceId = parseInt(id);
      const conns = await apiClient.listConnections(workspaceId);
      setConnections(conns);
    } catch (error: any) {
      console.error("Error refreshing connections:", error);
    }
  };

  // Handle app selection from browse dialog
  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    // Scroll to the app card
    setTimeout(() => {
      const cardElement = appCardRefs.current[appId];
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight the card temporarily
        cardElement.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          cardElement.classList.remove("ring-2", "ring-primary", "ring-offset-2");
        }, 2000);
      }
    }, 100);
  };

  const filteredApps = filterApps(supportedApps);
  const groupedApps = groupAppsByCategory(filteredApps);
  const workspaceId = id ? parseInt(id) : 0;

  if (isLoading) {
    return (
      <div className="h-screen flex bg-background">
        <WorkspaceSidebar currentWorkspaceId={id} />
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Đang tải danh sách apps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      <WorkspaceSidebar currentWorkspaceId={id} />
      <div className="flex-1 overflow-auto">
        <div className="container max-w-6xl mx-auto p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Kết nối ứng dụng</h1>
              <p className="text-muted-foreground">
                Kết nối với các phần mềm quản lý và kế toán của bạn
              </p>
            </div>
            <Button
              onClick={() => setIsBrowseDialogOpen(true)}
              className="gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm ứng dụng
            </Button>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm ứng dụng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Empty state */}
          {groupedApps.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "Không tìm thấy ứng dụng" : "Chưa có ứng dụng nào"}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {searchQuery
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Hiện tại chưa có ứng dụng nào được hỗ trợ. Vui lòng quay lại sau."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Apps grouped by category - Display as separate sections */}
          {groupedApps.length > 0 && (
            <div className="space-y-6">
              {groupedApps.map((group) => {
                const IconComponent = categoryIcons[group.category];
                return (
                  <Card key={group.category} className="shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">
                              {group.categoryLabel}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {group.apps.length} ứng dụng
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {group.apps.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                      {group.apps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.apps.map((app) => (
                            <div
                              key={app.id}
                              ref={(el) => {
                                appCardRefs.current[app.id] = el;
                              }}
                              className="transition-all duration-300"
                            >
                              <AppConnectionCard
                                app={app}
                                connection={getConnectionForApp(app.id)}
                                workspaceId={workspaceId}
                                onConnectionChange={handleConnectionChange}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Package className="w-10 h-10 text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Không có ứng dụng nào trong nhóm này
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Browse Apps Dialog */}
        <BrowseAppsDialog
          open={isBrowseDialogOpen}
          onOpenChange={setIsBrowseDialogOpen}
          workspaceId={workspaceId}
          connections={connections}
          onSelectApp={handleSelectApp}
        />
      </div>
    </div>
  );
};

export default AppConnections;

