import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Package, Store, Calculator, Box } from "lucide-react";
import AppBrowseCard from "./AppBrowseCard";
import { apiClient } from "@/lib/api";
import type { SupportedApp, ConnectedApp, AppCategory, GroupedApps } from "@/lib/types";

interface BrowseAppsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number;
  connections: ConnectedApp[];
  onSelectApp: (appId: string) => void;
}

const BrowseAppsDialog = ({
  open,
  onOpenChange,
  workspaceId,
  connections,
  onSelectApp,
}: BrowseAppsDialogProps) => {
  const [supportedApps, setSupportedApps] = useState<SupportedApp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Category labels
  const categoryLabels: Record<AppCategory, string> = {
    POS_SIMPLE: "Quản lý bán hàng",
    ACCOUNTING: "Kế toán",
    UNKNOWN: "Khác",
  };

  // Category icons
  const categoryIcons: Record<AppCategory, typeof Store> = {
    POS_SIMPLE: Store,
    ACCOUNTING: Calculator,
    UNKNOWN: Box,
  };

  // Load supported apps when dialog opens
  useEffect(() => {
    if (open) {
      const loadApps = async () => {
        setIsLoading(true);
        try {
          const apps = await apiClient.listSupportedApps(workspaceId);
          setSupportedApps(apps);
        } catch (error) {
          console.error("Error loading apps:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadApps();
    } else {
      // Reset search when dialog closes
      setSearchQuery("");
    }
  }, [open, workspaceId]);

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
        categoryLabels[app.category as AppCategory]?.toLowerCase().includes(query)
    );
  };

  // Get connection for an app
  const getConnectionForApp = (appId: string): ConnectedApp | null => {
    return connections.find((conn) => conn.app_id === appId) || null;
  };

  // Handle app selection
  const handleSelectApp = (appId: string) => {
    onSelectApp(appId);
    onOpenChange(false);
  };

  const filteredApps = filterApps(supportedApps);
  const groupedApps = groupAppsByCategory(filteredApps);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm ứng dụng</DialogTitle>
          <DialogDescription>
            Chọn ứng dụng bạn muốn kết nối với workspace của mình
          </DialogDescription>
        </DialogHeader>

        {/* Search bar */}
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

        {/* Content area - scrollable */}
        <div className="flex-1 overflow-y-auto mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Đang tải danh sách ứng dụng...</p>
            </div>
          ) : groupedApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "Không tìm thấy ứng dụng" : "Chưa có ứng dụng nào"}
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {searchQuery
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Hiện tại chưa có ứng dụng nào được hỗ trợ."}
              </p>
            </div>
          ) : (
            <Tabs defaultValue={groupedApps[0]?.category || "POS_SIMPLE"} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                {groupedApps.map((group) => {
                  const IconComponent = categoryIcons[group.category];
                  return (
                    <TabsTrigger key={group.category} value={group.category} className="text-sm">
                      <IconComponent className="w-4 h-4 mr-2" />
                      {group.categoryLabel}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {group.apps.length}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {groupedApps.map((group) => (
                <TabsContent key={group.category} value={group.category} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.apps.map((app) => (
                      <AppBrowseCard
                        key={app.id}
                        app={app}
                        connection={getConnectionForApp(app.id)}
                        onConnect={() => handleSelectApp(app.id)}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrowseAppsDialog;

