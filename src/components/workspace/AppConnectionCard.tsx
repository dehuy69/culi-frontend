import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Link2,
  Key,
  Server,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import type { SupportedApp, ConnectedApp, MCPAuthType, MCPAuthConfig } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

interface AppConnectionCardProps {
  app: SupportedApp;
  connection: ConnectedApp | null;
  workspaceId: number;
  onConnectionChange: () => void;
}

const AppConnectionCard = ({
  app,
  connection,
  workspaceId,
  onConnectionChange,
}: AppConnectionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(!connection);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // API connection fields
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [retailer, setRetailer] = useState(connection?.retailer || "");

  // MCP connection fields
  const [mcpServerUrl, setMcpServerUrl] = useState("");
  const [mcpAuthType, setMcpAuthType] = useState<MCPAuthType>("none");
  const [mcpAuthConfig, setMcpAuthConfig] = useState<MCPAuthConfig>({});

  const isConnected = connection?.status === "connected" || connection?.status === "active";
  const isApiConnection = app.connection_method === "api";
  const isMcpConnection = app.connection_method === "mcp";

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "POS_SIMPLE":
        return "Quản lý bán hàng & Kế toán đơn giản";
      case "ACCOUNTING":
        return "Phần mềm kế toán";
      case "UNKNOWN":
        return "Chưa phân loại";
      default:
        return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "POS_SIMPLE":
        return "🏪";
      case "ACCOUNTING":
        return "📊";
      default:
        return "📦";
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      let connectionData: any = {
        app_id: app.id,
        name: `${app.name} Connection`,
        app_category: app.category,
        connection_method: app.connection_method,
      };

      if (isApiConnection) {
        if (!clientId || !clientSecret) {
          toast({
            title: "Vui lòng điền đầy đủ thông tin",
            description: "Client ID và Client Secret là bắt buộc",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        connectionData.client_id = clientId;
        connectionData.client_secret = clientSecret;
        if (app.requires_retailer && retailer) {
          connectionData.retailer = retailer;
        }
      } else if (isMcpConnection) {
        if (!mcpServerUrl) {
          toast({
            title: "Vui lòng nhập MCP Server URL",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        connectionData.mcp_server_url = mcpServerUrl;
        connectionData.mcp_auth_type = mcpAuthType;
        if (mcpAuthType !== "none") {
          // Validate auth config based on auth type
          if (mcpAuthType === "api_key" && !mcpAuthConfig.api_key) {
            toast({
              title: "Vui lòng nhập API Key",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          if (mcpAuthType === "bearer" && !mcpAuthConfig.bearer_token) {
            toast({
              title: "Vui lòng nhập Bearer Token",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          if (mcpAuthType === "basic" && (!mcpAuthConfig.username || !mcpAuthConfig.password)) {
            toast({
              title: "Vui lòng nhập đầy đủ Username và Password",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          connectionData.mcp_auth_config = mcpAuthConfig;
        }
      }

      let updatedConnection: ConnectedApp;
      if (connection) {
        updatedConnection = await apiClient.updateConnection(
          workspaceId,
          connection.id,
          connectionData
        );
        toast({ title: "Đã cập nhật kết nối" });
      } else {
        updatedConnection = await apiClient.createConnection(workspaceId, connectionData);
        toast({ title: "Đã tạo kết nối mới" });
      }

      // Auto-test connection after create/update
      try {
        const testResult = await apiClient.testConnection(workspaceId, updatedConnection.id);
        if (testResult.status === "success") {
          // Update status to active if test succeeds
          await apiClient.updateConnection(workspaceId, updatedConnection.id, {
            status: "active",
          });
          toast({
            title: "Kết nối thành công!",
            description: testResult.message || "Đã kết nối thành công",
          });
        } else {
          // Update status to error if test fails
          await apiClient.updateConnection(workspaceId, updatedConnection.id, {
            status: "error",
          });
          toast({
            title: "Kết nối đã được tạo nhưng test thất bại",
            description: testResult.message || "Vui lòng kiểm tra lại thông tin",
            variant: "destructive",
          });
        }
      } catch (testError: any) {
        // If test fails, update status to error
        try {
          await apiClient.updateConnection(workspaceId, updatedConnection.id, {
            status: "error",
          });
        } catch (updateError) {
          console.error("Error updating connection status:", updateError);
        }
        toast({
          title: "Kết nối đã được tạo nhưng test thất bại",
          description: testError.message || "Không thể test kết nối",
          variant: "destructive",
        });
      }

      onConnectionChange();
      setIsExpanded(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo/cập nhật kết nối",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!connection) return;

    setIsTesting(true);
    try {
      const testResult = await apiClient.testConnection(workspaceId, connection.id);
      if (testResult.status === "success") {
        // Update status to active if test succeeds
        await apiClient.updateConnection(workspaceId, connection.id, {
          status: "active",
        });
        toast({
          title: "Kết nối thành công!",
          description: testResult.message || "Đã kết nối thành công",
        });
      } else {
        // Update status to error if test fails
        await apiClient.updateConnection(workspaceId, connection.id, {
          status: "error",
        });
        toast({
          title: "Test kết nối thất bại",
          description: testResult.message || "Vui lòng kiểm tra lại thông tin",
          variant: "destructive",
        });
      }
      onConnectionChange();
    } catch (error: any) {
      // Update status to error if test throws exception
      try {
        await apiClient.updateConnection(workspaceId, connection.id, {
          status: "error",
        });
      } catch (updateError) {
        console.error("Error updating connection status:", updateError);
      }
      toast({
        title: "Lỗi test kết nối",
        description: error.message || "Không thể test kết nối",
        variant: "destructive",
      });
      onConnectionChange();
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!connection) return;

    setIsLoading(true);
    try {
      await apiClient.deleteConnection(workspaceId, connection.id);
      toast({ title: "Đã xóa kết nối" });
      setClientId("");
      setClientSecret("");
      setRetailer("");
      setMcpServerUrl("");
      setMcpAuthType("none");
      setMcpAuthConfig({});
      onConnectionChange();
      setIsExpanded(true);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa kết nối",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const renderApiForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${app.id}-client-id`}>Client ID</Label>
        <Input
          id={`${app.id}-client-id`}
          type="text"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="Nhập Client ID"
          disabled={isConnected && connection}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${app.id}-client-secret`}>Client Secret</Label>
        <Input
          id={`${app.id}-client-secret`}
          type="password"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          placeholder="Nhập Client Secret"
          disabled={isConnected && connection}
        />
      </div>
      {app.requires_retailer && (
        <div className="space-y-2">
          <Label htmlFor={`${app.id}-retailer`}>Retailer</Label>
          <Input
            id={`${app.id}-retailer`}
            type="text"
            value={retailer}
            onChange={(e) => setRetailer(e.target.value)}
            placeholder="Nhập tên retailer"
            disabled={isConnected && connection}
          />
        </div>
      )}
    </div>
  );

  const renderMcpForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${app.id}-mcp-url`}>MCP Server URL</Label>
        <Input
          id={`${app.id}-mcp-url`}
          type="url"
          value={mcpServerUrl}
          onChange={(e) => setMcpServerUrl(e.target.value)}
          placeholder="https://your-mcp-server.com"
          disabled={isConnected && connection}
        />
        <p className="text-xs text-muted-foreground">
          URL của MCP server để kết nối
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${app.id}-mcp-auth-type`}>Authentication Type</Label>
        <Select
          value={mcpAuthType}
          onValueChange={(value: MCPAuthType) => {
            setMcpAuthType(value);
            setMcpAuthConfig({});
          }}
          disabled={isConnected && connection}
        >
          <SelectTrigger id={`${app.id}-mcp-auth-type`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Không cần xác thực</SelectItem>
            <SelectItem value="api_key">API Key</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {mcpAuthType === "api_key" && (
        <div className="space-y-2">
          <Label htmlFor={`${app.id}-mcp-api-key`}>API Key</Label>
          <Input
            id={`${app.id}-mcp-api-key`}
            type="password"
            value={mcpAuthConfig.api_key || ""}
            onChange={(e) =>
              setMcpAuthConfig({ ...mcpAuthConfig, api_key: e.target.value })
            }
            placeholder="Nhập API Key"
            disabled={isConnected && connection}
          />
        </div>
      )}
      {mcpAuthType === "bearer" && (
        <div className="space-y-2">
          <Label htmlFor={`${app.id}-mcp-bearer`}>Bearer Token</Label>
          <Input
            id={`${app.id}-mcp-bearer`}
            type="password"
            value={mcpAuthConfig.bearer_token || ""}
            onChange={(e) =>
              setMcpAuthConfig({ ...mcpAuthConfig, bearer_token: e.target.value })
            }
            placeholder="Nhập Bearer Token"
            disabled={isConnected && connection}
          />
        </div>
      )}
      {mcpAuthType === "basic" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor={`${app.id}-mcp-username`}>Username</Label>
              <Input
                id={`${app.id}-mcp-username`}
                type="text"
                value={mcpAuthConfig.username || ""}
                onChange={(e) =>
                  setMcpAuthConfig({ ...mcpAuthConfig, username: e.target.value })
                }
                placeholder="Username"
                disabled={isConnected && connection}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${app.id}-mcp-password`}>Password</Label>
              <Input
                id={`${app.id}-mcp-password`}
                type="password"
                value={mcpAuthConfig.password || ""}
                onChange={(e) =>
                  setMcpAuthConfig({ ...mcpAuthConfig, password: e.target.value })
                }
                placeholder="Password"
                disabled={isConnected && connection}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="text-3xl">{getCategoryIcon(app.category)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{app.name}</CardTitle>
                  <Badge
                    variant={
                      app.connection_method === "api" ? "default" : "secondary"
                    }
                  >
                    {app.connection_method === "api" ? (
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
                <CardDescription className="text-sm">{app.description}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(app.category)}
                  </Badge>
                  {isConnected ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã kết nối</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>Chưa kết nối</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-4">
            {isApiConnection && renderApiForm()}
            {isMcpConnection && renderMcpForm()}

            <div className="flex gap-2 pt-2">
              {!isConnected ? (
                <Button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="gradient-primary flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang kết nối...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Kết nối
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    variant="outline"
                    className="flex-1"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang test...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test kết nối
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsExpanded(false)}
                    variant="outline"
                  >
                    Đóng
                  </Button>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="destructive"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        )}
        {!isExpanded && (
          <CardContent>
            <Button
              onClick={() => setIsExpanded(true)}
              variant="outline"
              className="w-full"
            >
              {isConnected ? "Quản lý kết nối" : "Thiết lập kết nối"}
            </Button>
          </CardContent>
        )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa kết nối</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kết nối với {app.name}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
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
    </>
  );
};

export default AppConnectionCard;

