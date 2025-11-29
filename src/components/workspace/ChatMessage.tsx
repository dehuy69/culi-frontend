import type { FrontendMessage } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, History, Database, FileText, Zap, CheckCircle2, Loader2, XCircle, Brain, Target } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: FrontendMessage;
}

const reasoningIcons = {
  search: Search,
  history: History,
  mcp: Database,
  strategy: FileText,
  execute: Zap,
  intent: Brain,
  plan: Target,
  step: Zap,
  web_search: Search,
  app_data: Database,
};

const statusIcons = {
  pending: Loader2,
  processing: Loader2,
  completed: CheckCircle2,
  error: XCircle,
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          C
        </div>
      )}
      
      <div className={cn("max-w-[80%] space-y-2", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "gradient-primary text-white"
              : "bg-muted text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {message.reasoning && message.reasoning.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
              <span>Quá trình suy luận ({message.reasoning.length} bước)</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {message.reasoning.map((step) => {
                const Icon = reasoningIcons[step.type];
                const StatusIcon = statusIcons[step.status];
                return (
                  <div
                    key={step.id}
                    className="bg-background border border-border rounded-lg p-3 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{step.title}</span>
                      <StatusIcon
                        className={cn(
                          "w-4 h-4 ml-auto",
                          step.status === "completed" && "text-success",
                          step.status === "error" && "text-destructive",
                          (step.status === "pending" || step.status === "processing") && "text-muted-foreground animate-spin"
                        )}
                      />
                    </div>
                    {step.details && (
                      <p className="text-xs text-muted-foreground pl-6">{step.details}</p>
                    )}
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        <span className="text-xs text-muted-foreground px-2">
          {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
          {message.role[0].toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
