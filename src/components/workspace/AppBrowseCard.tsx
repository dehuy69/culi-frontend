import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Key, Server, Plus } from "lucide-react";
import type { SupportedApp, ConnectedApp } from "@/lib/types";

interface AppBrowseCardProps {
  app: SupportedApp;
  connection: ConnectedApp | null;
  onConnect: () => void;
}

const AppBrowseCard = ({ app, connection, onConnect }: AppBrowseCardProps) => {
  const isConnected = connection?.status === "connected" || connection?.status === "active";
  const isApiConnection = app.connection_method === "api";
  const isMcpConnection = app.connection_method === "mcp";

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "POS_SIMPLE":
        return "Quản lý bán hàng";
      case "ACCOUNTING":
        return "Kế toán";
      case "UNKNOWN":
        return "Khác";
      default:
        return category;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">
                {app.category === "POS_SIMPLE" && "🏪"}
                {app.category === "ACCOUNTING" && "📊"}
                {app.category === "UNKNOWN" && "📦"}
              </div>
              <h3 className="font-semibold text-base truncate">{app.name}</h3>
              <Badge
                variant={isApiConnection ? "default" : "secondary"}
                className="text-xs"
              >
                {isApiConnection ? (
                  <>
                    <Key className="w-3 h-3 mr-1" />
                    API
                  </>
                ) : (
                  <>
                    <Server className="w-3 h-3 mr-1" />
                    MCP
                  </>
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {app.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {getCategoryLabel(app.category)}
              </Badge>
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Đã kết nối</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <XCircle className="w-3 h-3" />
                  <span>Chưa kết nối</span>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={onConnect}
            variant={isConnected ? "outline" : "default"}
            size="sm"
            className="shrink-0"
          >
            {isConnected ? (
              "Quản lý"
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Kết nối
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppBrowseCard;

