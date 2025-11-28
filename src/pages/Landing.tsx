import { Button } from "@/components/ui/button";
import { Brain, Database, Zap, Shield, MessageSquare, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI Thông Minh",
      description: "Agent AI tự động phân tích và đưa ra giải pháp kế toán phù hợp",
    },
    {
      icon: Link2,
      title: "Kết Nối Dễ Dàng",
      description: "Tích hợp nhanh với KiotViet và các phần mềm quản lý khác",
    },
    {
      icon: MessageSquare,
      title: "Chat Tự Nhiên",
      description: "Giao tiếp bằng tiếng Việt, không cần kiến thức kế toán chuyên sâu",
    },
    {
      icon: Database,
      title: "Quản Lý Workspace",
      description: "Tổ chức nhiều hộ kinh doanh trong các workspace riêng biệt",
    },
    {
      icon: Zap,
      title: "Xử Lý Nhanh",
      description: "Tự động tạo báo cáo, phân tích dữ liệu trong vài giây",
    },
    {
      icon: Shield,
      title: "An Toàn Bảo Mật",
      description: "Dữ liệu được mã hóa và lưu trữ an toàn tuyệt đối",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" showText={true} />
          <Button onClick={() => navigate("/auth")} variant="outline">
            Đăng nhập
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Kế Toán Hộ Kinh Doanh
            <br />
            <span className="gradient-text">Chưa Bao Giờ Dễ Dàng Đến Vậy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Culi là AI agent giúp bạn quản lý kế toán đơn giản, phù hợp với hộ kinh doanh tại Việt Nam. 
            Không cần kiến thức chuyên môn, chỉ cần chat và để AI làm việc.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Bắt đầu ngay - Miễn phí
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Tính Năng Nổi Bật</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Culi mang đến giải pháp kế toán toàn diện cho hộ kinh doanh
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-primary rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Sẵn Sàng Bắt Đầu?</h2>
          <p className="text-lg mb-6 opacity-90">
            Tham gia cùng hàng nghìn hộ kinh doanh đang sử dụng Culi để quản lý kế toán hiệu quả
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="hover-scale"
          >
            Tạo tài khoản miễn phí
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Culi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
