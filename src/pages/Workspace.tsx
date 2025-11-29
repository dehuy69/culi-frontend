import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storage } from "@/lib/localStorage";
import { apiClient } from "@/lib/api";
import type { Message as BackendMessage, Conversation, StreamEvent, ReasoningStep } from "@/lib/types";
import type { FrontendMessage } from "@/lib/types";
import ChatPanel from "@/components/workspace/ChatPanel";
import BrowserPanel from "@/components/workspace/BrowserPanel";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Helper functions for reasoning steps
const getReasoningType = (node: string): ReasoningStep["type"] => {
  if (node === "intent_router") return "intent";
  if (node === "web_search") return "search";
  if (node === "app_read") return "mcp";
  if (node === "app_plan") return "strategy";
  if (node === "execute_plan") return "execute";
  if (node === "context") return "history";
  return "history";
};

const getNodeTitle = (node: string): string => {
  const titles: Record<string, string> = {
    intent_router: "Phân loại yêu cầu",
    context: "Tải ngữ cảnh",
    web_search: "Tìm kiếm web",
    app_read: "Đọc dữ liệu ứng dụng",
    app_plan: "Lập kế hoạch",
    execute_plan: "Thực thi kế hoạch",
    answer: "Tạo câu trả lời",
  };
  return titles[node] || `Xử lý: ${node}`;
};

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

    // Create assistant message for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: FrontendMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      reasoning: [],
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Track reasoning steps
    const reasoningSteps = new Map<string, ReasoningStep>();

    // Cleanup function for stream
    let cleanup: (() => void) | null = null;

    try {
      cleanup = apiClient.streamMessage(
        workspaceId,
        content,
        conversationId,
        (event: StreamEvent) => {
          // Handle streaming events
          setMessages((prev) => {
            const updated = [...prev];
            const assistantIndex = updated.findIndex((msg) => msg.id === assistantMessageId);
            
            if (assistantIndex === -1) return prev;

            const currentMsg = updated[assistantIndex];
            const updatedReasoning = currentMsg.reasoning ? [...currentMsg.reasoning] : [];
            let messageUpdated = false; // Track if message was updated in switch case

            switch (event.event) {
              case "node_start":
                // Add reasoning step for node start
                if (event.data.node) {
                  const stepId = `step-${event.data.node}-${Date.now()}`;
                  const step: ReasoningStep = {
                    id: stepId,
                    type: getReasoningType(event.data.node),
                    status: "processing",
                    title: getNodeTitle(event.data.node),
                    node: event.data.node,
                    timestamp: event.data.timestamp,
                  };
                  reasoningSteps.set(event.data.node, step);
                  updatedReasoning.push(step);
                }
                break;

              case "node_end":
                // Update reasoning step to completed
                if (event.data.node) {
                  const step = reasoningSteps.get(event.data.node);
                  if (step) {
                    step.status = "completed";
                    const stepIndex = updatedReasoning.findIndex((s) => s.id === step.id);
                    if (stepIndex !== -1) {
                      updatedReasoning[stepIndex] = { ...step };
                    }
                  }
                }
                break;

              case "intent":
                // Update with intent information
                if (event.data.intent) {
                  const intentStep = updatedReasoning.find((s) => s.type === "intent");
                  if (intentStep) {
                    intentStep.details = `Intent: ${event.data.intent}`;
                  }
                }
                break;

              case "plan":
                // Add plan reasoning step
                if (event.data.plan) {
                  const planStep: ReasoningStep = {
                    id: `plan-${Date.now()}`,
                    type: "strategy",
                    status: "completed",
                    title: "Đã tạo kế hoạch",
                    details: `Kế hoạch có ${event.data.plan.steps?.length || 0} bước`,
                    node: event.data.node,
                    timestamp: event.data.timestamp,
                  };
                  updatedReasoning.push(planStep);
                }
                break;

              case "step":
                // Add step execution reasoning
                if (event.data.step) {
                  const stepExecution: ReasoningStep = {
                    id: `exec-${event.data.current_step}-${Date.now()}`,
                    type: "execute",
                    status: event.data.step.status === "failed" ? "error" : "completed",
                    title: `Bước ${event.data.current_step}/${event.data.total_steps}: ${event.data.step.action}`,
                    details: event.data.step.error || event.data.step.output,
                    node: event.data.node,
                    timestamp: event.data.timestamp,
                  };
                  updatedReasoning.push(stepExecution);
                }
                break;

              case "web_search":
                // Add web search reasoning
                if (event.data.results_count) {
                  const webStep: ReasoningStep = {
                    id: `web-${Date.now()}`,
                    type: "search",
                    status: "completed",
                    title: "Tìm kiếm thông tin",
                    details: `Tìm thấy ${event.data.results_count} kết quả`,
                    node: event.data.node,
                    timestamp: event.data.timestamp,
                  };
                  updatedReasoning.push(webStep);
                }
                break;

              case "answer":
                // Update answer content (even if empty, to show that answer node completed)
                updated[assistantIndex] = {
                  ...currentMsg,
                  content: event.data.content || currentMsg.content || "Đang tạo câu trả lời...",
                  reasoning: updatedReasoning,
                };
                messageUpdated = true;
                break;

              case "done":
                // Finalize message
                if (event.data.conversation_id && !conversationId) {
                  setConversationId(event.data.conversation_id);
                }
                updated[assistantIndex] = {
                  ...currentMsg,
                  content: event.data.answer || currentMsg.content,
                  reasoning: updatedReasoning,
                };
                messageUpdated = true;
                break;

              case "error":
                // Handle error
                const errorMessage = event.data.error || "Đã xảy ra lỗi";
                updated[assistantIndex] = {
                  ...currentMsg,
                  content: `❌ Lỗi: ${errorMessage}`,
                  reasoning: updatedReasoning,
                };
                messageUpdated = true;
                toast({
                  title: "Lỗi",
                  description: errorMessage,
                  variant: "destructive",
                });
                break;
            }

            // Only update reasoning if message wasn't already updated in switch case
            if (!messageUpdated) {
              updated[assistantIndex] = {
                ...currentMsg,
                reasoning: updatedReasoning,
              };
            }

            return updated;
          });
        },
        (error: Error) => {
          console.error("Stream error:", error);
          setError(error.message);
          toast({
            title: "Lỗi",
            description: error.message || "Không thể kết nối đến server",
            variant: "destructive",
          });
          // Update assistant message with error
          setMessages((prev) => {
            const updated = [...prev];
            const assistantIndex = updated.findIndex((msg) => msg.id === assistantMessageId);
            if (assistantIndex !== -1) {
              updated[assistantIndex] = {
                ...updated[assistantIndex],
                content: `❌ Lỗi: ${error.message}`,
              };
            }
            return updated;
          });
          setIsLoading(false);
        },
        () => {
          // Stream completed
          setIsLoading(false);
        }
      );
    } catch (error: any) {
      console.error("Error starting stream:", error);
      const errorMessage = error.message || "Không thể bắt đầu stream";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      // Remove assistant message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      setIsLoading(false);
    }

    // Store cleanup function for potential cancellation
    // (Could be used for cancel button in future)
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
