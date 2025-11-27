import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { storage } from "@/lib/localStorage";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

const MCPSettings = () => {
  const { id } = useParams();
  const [mcpConfig, setMcpConfig] = useState(storage.getMCPConfig());
  const [clientId, setClientId] = useState(mcpConfig.kiotviet.clientId);
  const [clientSecret, setClientSecret] = useState(mcpConfig.kiotviet.clientSecret);
  const [isConnected, setIsConnected] = useState(mcpConfig.kiotviet.isConnected);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    // Mock connection
    setTimeout(() => {
      if (clientId && clientSecret) {
        const newConfig = {
          kiotviet: {
            clientId,
            clientSecret,
            isConnected: true,
          },
        };
        storage.setMCPConfig(newConfig);
        setIsConnected(true);
        toast({ title: "Đã kết nối với KiotViet thành công!" });
      } else {
        toast({ title: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    const newConfig = {
      kiotviet: {
        clientId: "",
        clientSecret: "",
        isConnected: false,
      },
    };
    storage.setMCPConfig(newConfig);
    setClientId("");
    setClientSecret("");
    setIsConnected(false);
    toast({ title: "Đã ngắt kết nối" });
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
                    disabled={isConnected}
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
                    disabled={isConnected}
                  />
                </div>
                
                <div className="flex gap-3">
                  {!isConnected ? (
                    <Button onClick={handleConnect} disabled={isLoading} className="gradient-primary">
                      {isLoading ? "Đang kết nối..." : "Kết nối"}
                    </Button>
                  ) : (
                    <Button onClick={handleDisconnect} variant="destructive">
                      Ngắt kết nối
                    </Button>
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
