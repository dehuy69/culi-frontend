import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storage } from "@/lib/localStorage";
import { mockMessages } from "@/lib/mockData";
import { Message } from "@/lib/mockData";
import ChatPanel from "@/components/workspace/ChatPanel";
import BrowserPanel from "@/components/workspace/BrowserPanel";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { toast } from "@/hooks/use-toast";

const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showBrowser, setShowBrowser] = useState(true);
  const [browserUrl, setBrowserUrl] = useState("https://www.kiotviet.vn");
  const initialLoadRef = useRef(false);

  useEffect(() => {
    // Check auth
    if (!storage.getAuth()) {
      navigate("/auth");
      return;
    }

    if (!id) return;

    // Load messages (only once on mount)
    if (!initialLoadRef.current) {
      const savedMessages = storage.getMessages(id);
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else if (mockMessages[id]) {
        // Initialize with mock data if no saved messages
        setMessages(mockMessages[id]);
        mockMessages[id].forEach((msg) => storage.addMessage(id, msg));
      }
      initialLoadRef.current = true;
    }
  }, [id, navigate]);

  const handleSendMessage = (content: string) => {
    if (!id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    storage.addMessage(id, userMessage);

    // Simulate AI response with delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Tôi đang xử lý yêu cầu của bạn...",
        timestamp: new Date().toISOString(),
        reasoning: [
          {
            id: "r1",
            type: "mcp",
            status: "processing",
            title: "Đang kết nối với KiotViet",
          },
          {
            id: "r2",
            type: "strategy",
            status: "pending",
            title: "Đang phân tích dữ liệu",
          },
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      storage.addMessage(id, aiMessage);

      // Update to completed after another delay
      setTimeout(() => {
        const updatedMessage = {
          ...aiMessage,
          content:
            "Tôi đã phân tích yêu cầu của bạn. Đây là mock response. Trong phiên bản thật, tôi sẽ kết nối với backend để xử lý yêu cầu này.",
          reasoning: [
            {
              id: "r1",
              type: "mcp" as const,
              status: "completed" as const,
              title: "Đã kết nối với KiotViet",
              details: "Lấy được dữ liệu từ API",
            },
            {
              id: "r2",
              type: "strategy" as const,
              status: "completed" as const,
              title: "Đã phân tích dữ liệu",
              details: "Tổng hợp thông tin và đưa ra kết quả",
            },
          ],
        };
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = updatedMessage;
          return newMessages;
        });
      }, 2000);
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar currentWorkspaceId={id} />
        
        <div className="flex-1 flex overflow-hidden">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onToggleBrowser={() => setShowBrowser(!showBrowser)}
            showBrowser={showBrowser}
          />
          
          {showBrowser && (
            <BrowserPanel
              url={browserUrl}
              onUrlChange={setBrowserUrl}
              onClose={() => setShowBrowser(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
