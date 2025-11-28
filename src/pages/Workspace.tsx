import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storage } from "@/lib/localStorage";
import { apiClient } from "@/lib/api";
import type { Message as BackendMessage, Conversation } from "@/lib/types";
import type { FrontendMessage } from "@/lib/types";
import ChatPanel from "@/components/workspace/ChatPanel";
import BrowserPanel from "@/components/workspace/BrowserPanel";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Workspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [showBrowser, setShowBrowser] = useState(true);
  const [browserUrl, setBrowserUrl] = useState("https://www.kiotviet.vn");
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadRef = useRef(false);

  // Helper function to convert backend message to frontend format
  const convertMessage = (msg: BackendMessage): FrontendMessage => {
    return {
      id: msg.id.toString(),
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
      timestamp: new Date(msg.created_at).toISOString(),
      reasoning: msg.message_metadata?.step_results ? [] : undefined,
    };
  };

  useEffect(() => {
    // Check auth
    if (!storage.getAuth()) {
      navigate("/auth");
      return;
    }

    if (!id) {
      navigate("/dashboard");
      return;
    }

    // Load messages from API (only once on mount)
    if (!initialLoadRef.current) {
      loadConversationMessages();
      initialLoadRef.current = true;
    }
  }, [id, navigate]);

  const loadConversationMessages = async () => {
    if (!id) return;

    setIsLoadingMessages(true);
    setError(null);

    try {
      const workspaceId = parseInt(id);
      if (isNaN(workspaceId)) {
        throw new Error("Invalid workspace ID");
      }

      // Get conversations
      const conversationsResponse = await apiClient.listConversations(workspaceId);
      if (
        conversationsResponse.conversations &&
        conversationsResponse.conversations.length > 0
      ) {
        // Use the first conversation (or most recent)
        const firstConv = conversationsResponse.conversations[0];
        setConversationId(firstConv.id);
        // Load messages for this conversation
        const apiMessages = await apiClient.getMessages(workspaceId, firstConv.id);
        // Convert API messages to frontend Message format
        const convertedMessages = apiMessages.map(convertMessage);
        setMessages(convertedMessages);
      } else {
        // No conversations yet, start with empty messages
        setMessages([]);
        setConversationId(undefined);
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      setError(error.message || "Không thể tải tin nhắn. Vui lòng thử lại.");
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!id) return;
    if (isLoading) return; // Prevent multiple simultaneous sends

    setIsLoading(true);
    setError(null);

    const workspaceId = parseInt(id);
    if (isNaN(workspaceId)) {
      toast({
        title: "Lỗi",
        description: "Invalid workspace ID",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Add user message to UI immediately
    const userMessage: FrontendMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: FrontendMessage = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "Đang xử lý...",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Send message to API
      const response = await apiClient.sendMessage(workspaceId, content, conversationId);

      // Update conversation ID if this is a new conversation
      if (response.conversation_id && !conversationId) {
        setConversationId(response.conversation_id);
      }

      // Reload messages from API to get the full conversation with proper IDs
      if (response.conversation_id) {
        const apiMessages = await apiClient.getMessages(workspaceId, response.conversation_id);
        const convertedMessages = apiMessages.map(convertMessage);
        setMessages(convertedMessages);
      } else {
        // If no conversation_id, remove loading and add response manually
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== loadingMessage.id);
          return [
            ...filtered,
            {
              id: `response-${Date.now()}`,
              role: "assistant",
              content: response.answer || "Xin lỗi, không thể tạo phản hồi.",
              timestamp: new Date().toISOString(),
            },
          ];
        });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage =
        error.message || "Không thể gửi tin nhắn. Vui lòng thử lại.";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });

      // Remove loading message on error, keep user message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingMessages) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex flex-1 overflow-hidden">
          <WorkspaceSidebar currentWorkspaceId={id} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Đang tải tin nhắn...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex flex-1 overflow-hidden">
          <WorkspaceSidebar currentWorkspaceId={id} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={loadConversationMessages}
                className="text-primary hover:underline"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar currentWorkspaceId={id} />

        <div className="flex-1 flex overflow-hidden relative">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onToggleBrowser={() => setShowBrowser(!showBrowser)}
            showBrowser={showBrowser}
            isLoading={isLoading}
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
