import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { storage } from "@/lib/localStorage";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { ConnectedApp } from "@/lib/types";

const MCPSettings = () => {
  const { id } = useParams();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConnections, setIsLoadingConnections] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [connection, setConnection] = useState<ConnectedApp | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing connections
  useEffect(() => {
    const loadConnections = async () => {
      if (!id) return;
      setIsLoadingConnections(true);
      try {
        const workspaceId = parseInt(id);
        const connections = await apiClient.listConnections(workspaceId);
        // Find KiotViet connection
        const kiotvietConnection = connections.find(
          (conn: ConnectedApp) => conn.app_id === "kiotviet"
        );
        if (kiotvietConnection) {
          setConnection(kiotvietConnection);
          setConnectionId(kiotvietConnection.id);
          setIsConnected(kiotvietConnection.status === "connected");
          setClientId(kiotvietConnection.client_id || "");
          // Don't load client secret for security
        }
      } catch (error: any) {
        console.error("Error loading connections:", error);
        setError(error.message || "Không thể tải danh sách kết nối");
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách kết nối",
          variant: "destructive",
        });
      } finally {
        setIsLoadingConnections(false);
      }
    };
    loadConnections();
  }, [id]);

  const handleConnect = async () => {
    if (!id) return;
    if (!clientId || !clientSecret) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin",
        description: "Client ID và Client Secret là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const workspaceId = parseInt(id);
      if (isNaN(workspaceId)) {
        throw new Error("Invalid workspace ID");
      }

      let updatedConnection: ConnectedApp;

      if (connectionId) {
        // Update existing connection
        updatedConnection = await apiClient.updateConnection(workspaceId, connectionId, {
          client_id: clientId,
          client_secret: clientSecret,
        });
        toast({ title: "Đã cập nhật thông tin kết nối" });
      } else {
        // Create new connection
        updatedConnection = await apiClient.createConnection(workspaceId, {
          app_id: "kiotviet",
          name: "KiotViet Connection",
          app_category: "accounting",
          connection_method: "oauth2",
          client_id: clientId,
          client_secret: clientSecret,
        });
        toast({ title: "Đã tạo kết nối mới" });
      }

      setConnection(updatedConnection);
      setConnectionId(updatedConnection.id);
      setIsConnected(updatedConnection.status === "connected");

      // Test the connection
      await handleTestConnection();
    } catch (error: any) {
      console.error("Error connecting:", error);
      const errorMessage = error.message || "Không thể tạo/cập nhật kết nối. Vui lòng thử lại.";
      setError(errorMessage);
      toast({
        title: "Lỗi kết nối",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!id || !connectionId) return;

    setIsTesting(true);
    setError(null);
    try {
      const workspaceId = parseInt(id);
      const testResult = await apiClient.testConnection(workspaceId, connectionId);
      if (testResult.status === "success") {
        setIsConnected(true);
        toast({
          title: "Kết nối thành công!",
          description: testResult.message || "Đã kết nối với KiotViet thành công",
        });
        // Reload connection to get updated status
        const connections = await apiClient.listConnections(workspaceId);
        const updated = connections.find((c) => c.id === connectionId);
        if (updated) {
          setConnection(updated);
          setIsConnected(updated.status === "connected");
        }
      } else {
        setIsConnected(false);
        toast({
          title: "Test kết nối thất bại",
          description: testResult.message || "Vui lòng kiểm tra lại thông tin credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      setError(error.message || "Không thể test kết nối");
      toast({
        title: "Lỗi test kết nối",
        description: error.message || "Không thể test kết nối. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!id || !connectionId) return;

    setIsLoading(true);
    setError(null);
    try {
      const workspaceId = parseInt(id);
      await apiClient.deleteConnection(workspaceId, connectionId);

      setConnection(null);
      setConnectionId(null);
      setClientId("");
      setClientSecret("");
      setIsConnected(false);
      toast({ title: "Đã ngắt kết nối" });
    } catch (error: any) {
      console.error("Error disconnecting:", error);
      const errorMessage = error.message || "Không thể xóa kết nối. Vui lòng thử lại.";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <WorkspaceSidebar currentWorkspaceId={id} />
      
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">MCP Connections</h1>
            <p className="text-muted-foreground">Kết nối với các phần mềm quản lý của bạn</p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>KiotViet</CardTitle>
                    <CardDescription>Phần mềm quản lý bán hàng KiotViet</CardDescription>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Đã kết nối</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Chưa kết nối</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input
                    id="client-id"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Nhập Client ID"
                    disabled={isConnected && !connectionId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input
                    id="client-secret"
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Nhập Client Secret"
                    disabled={isConnected && !connectionId}
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isConnected ? (
                    <Button
                      onClick={handleConnect}
                      disabled={isLoading || isLoadingConnections}
                      className="gradient-primary"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang kết nối...
                        </>
                      ) : (
                        "Kết nối"
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleTestConnection}
                        disabled={isTesting || isLoading}
                        variant="outline"
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
                        onClick={handleDisconnect}
                        variant="destructive"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang xóa...
                          </>
                        ) : (
                          "Ngắt kết nối"
                        )}
                      </Button>
                    </>
                  )}
                </div>

                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="text-sm font-medium">Hướng dẫn lấy credentials:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Đăng nhập vào tài khoản KiotViet của bạn</li>
                    <li>Vào phần Settings → API</li>
                    <li>Tạo ứng dụng mới hoặc sử dụng ứng dụng có sẵn</li>
                    <li>Copy Client ID và Client Secret</li>
                  </ol>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => window.open("https://www.kiotviet.vn/", "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Đến trang KiotViet
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-muted-foreground">Các MCP khác</CardTitle>
                <CardDescription>Sắp có thêm nhiều kết nối hơn</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Chúng tôi đang phát triển kết nối với các phần mềm khác như MISA, Fast, v.v.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPSettings;
