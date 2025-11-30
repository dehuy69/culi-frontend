import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Monitor, MonitorOff } from "lucide-react";
import type { FrontendMessage } from "@/lib/types";
import ChatMessage from "./ChatMessage";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: FrontendMessage[];
  onSendMessage: (content: string) => void;
  onToggleBrowser: () => void;
  showBrowser: boolean;
  isLoading?: boolean;
}

const ChatPanel = ({
  messages,
  onSendMessage,
  onToggleBrowser,
  showBrowser,
  isLoading = false,
}: ChatPanelProps) => {
  const isMobile = useIsMobile();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className={cn(
        "border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-sm",
        isMobile ? "p-3" : "p-4"
      )}>
        <div className={cn(isMobile && "hidden")}>
          <h2 className="font-semibold">Chat với Culi</h2>
          <p className="text-xs text-muted-foreground">AI Agent hỗ trợ kế toán</p>
        </div>
        {!isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleBrowser}
            className="gap-2"
          >
            {showBrowser ? (
              <>
                <MonitorOff className="w-4 h-4" />
                Ẩn Browser
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                Hiện Browser
              </>
            )}
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className={cn("flex-1", isMobile ? "p-2" : "p-4")}>
        <div className={cn("space-y-4 mx-auto", isMobile ? "max-w-full px-2" : "max-w-4xl")}>
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground animate-fade-in">
              <p className={cn("mb-2", isMobile ? "text-base" : "text-lg")}>Xin chào! Tôi là Culi 👋</p>
              <p className={cn(isMobile ? "text-xs" : "text-sm")}>Hãy hỏi tôi bất cứ điều gì về kế toán hộ kinh doanh của bạn</p>
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                C
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className={cn("border-t border-border bg-background", isMobile ? "p-2" : "p-4")}>
        <form onSubmit={handleSubmit} className={cn("mx-auto", isMobile ? "max-w-full" : "max-w-4xl")}>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn... (Shift + Enter để xuống dòng)"
              className={cn(
                "resize-none",
                isMobile ? "min-h-[50px] max-h-[150px] text-sm" : "min-h-[60px] max-h-[200px]"
              )}
              rows={isMobile ? 1 : 2}
            />
            <Button
              type="submit"
              size="icon"
              className={cn(
                "gradient-primary flex-shrink-0",
                isMobile ? "h-[50px] w-[50px]" : "h-[60px] w-[60px]"
              )}
              disabled={!input.trim() || isLoading}
            >
              <Send className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
