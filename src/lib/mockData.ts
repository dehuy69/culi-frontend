export interface Workspace {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  messageCount: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  reasoning?: ReasoningStep[];
}

export interface ReasoningStep {
  id: string;
  type: "search" | "history" | "mcp" | "strategy" | "execute";
  status: "pending" | "processing" | "completed" | "error";
  title: string;
  details?: string;
}

export const mockWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Cửa hàng Phụ kiện Di động",
    icon: "📱",
    createdAt: "2024-01-15",
    messageCount: 24,
  },
  {
    id: "2",
    name: "Quán Cafe Sáng",
    icon: "☕",
    createdAt: "2024-02-20",
    messageCount: 18,
  },
  {
    id: "3",
    name: "Shop Thời trang Nữ",
    icon: "👗",
    createdAt: "2024-03-10",
    messageCount: 32,
  },
];

export const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      role: "user",
      content: "Cho tôi xem doanh thu tháng này",
      timestamp: "2024-03-15T10:30:00Z",
    },
    {
      id: "m2",
      role: "assistant",
      content: "Doanh thu tháng 3/2024 của bạn là 45,230,000 VNĐ, tăng 12% so với tháng trước. Có 156 đơn hàng với giá trị đơn hàng trung bình là 290,000 VNĐ.",
      timestamp: "2024-03-15T10:30:15Z",
      reasoning: [
        {
          id: "r1",
          type: "mcp",
          status: "completed",
          title: "Truy vấn dữ liệu KiotViet",
          details: "Đã lấy dữ liệu doanh thu từ 01/03/2024 đến 15/03/2024",
        },
        {
          id: "r2",
          type: "strategy",
          status: "completed",
          title: "Phân tích doanh thu",
          details: "Tính toán tổng doanh thu, số đơn hàng và so sánh với tháng trước",
        },
      ],
    },
    {
      id: "m3",
      role: "user",
      content: "Sản phẩm nào bán chạy nhất?",
      timestamp: "2024-03-15T10:32:00Z",
    },
    {
      id: "m4",
      role: "assistant",
      content: "Top 3 sản phẩm bán chạy nhất:\n1. Ốp lưng iPhone 15 Pro - 45 cái\n2. Cáp sạc Type-C - 38 cái\n3. Tai nghe Bluetooth - 32 cái",
      timestamp: "2024-03-15T10:32:10Z",
      reasoning: [
        {
          id: "r3",
          type: "mcp",
          status: "completed",
          title: "Truy vấn sản phẩm KiotViet",
          details: "Lấy danh sách sản phẩm và số lượng bán ra",
        },
      ],
    },
  ],
  "2": [
    {
      id: "m5",
      role: "user",
      content: "Tạo báo cáo kế toán tháng này",
      timestamp: "2024-03-15T14:20:00Z",
    },
    {
      id: "m6",
      role: "assistant",
      content: "Tôi đã tạo báo cáo kế toán cho tháng 3/2024. Báo cáo bao gồm:\n- Doanh thu: 28,500,000 VNĐ\n- Chi phí: 12,300,000 VNĐ\n- Lợi nhuận: 16,200,000 VNĐ",
      timestamp: "2024-03-15T14:20:25Z",
      reasoning: [
        {
          id: "r4",
          type: "mcp",
          status: "completed",
          title: "Thu thập dữ liệu",
          details: "Lấy dữ liệu doanh thu và chi phí từ KiotViet",
        },
        {
          id: "r5",
          type: "strategy",
          status: "completed",
          title: "Lập báo cáo",
          details: "Tổng hợp các khoản thu chi và tính toán lợi nhuận",
        },
      ],
    },
  ],
  "3": [],
};

export const mockMCPConfig = {
  kiotviet: {
    clientId: "",
    clientSecret: "",
    isConnected: false,
  },
};
