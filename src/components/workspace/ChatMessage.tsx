import type { FrontendMessage } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, History, Database, FileText, Zap, CheckCircle2, Loader2, XCircle, Brain, Target } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const isUser = message.role === "user";

  return (
    <div className={cn("flex animate-fade-in", isUser ? "justify-end" : "justify-start", isMobile ? "gap-2" : "gap-3")}>
      {!isUser && (
        <div className={cn("rounded-full gradient-primary flex items-center justify-center text-white font-medium flex-shrink-0", isMobile ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm")}>
          C
        </div>
      )}
      
      <div className={cn("space-y-2", isUser && "flex flex-col items-end", isMobile ? "max-w-[95%]" : "max-w-[80%]")}>
        <div
          className={cn(
            "rounded-2xl",
            isUser
              ? "gradient-primary text-white"
              : "bg-muted text-foreground",
            isMobile ? "px-3 py-2" : "px-4 py-3"
          )}
        >
          {isUser ? (
            <p className={cn("whitespace-pre-wrap break-words", isMobile && "text-sm")}>{message.content}</p>
          ) : (
            <div className={cn("prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-a:text-primary prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground", isMobile ? "prose-xs" : "prose-sm")}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  h1: ({ node, ...props }) => (
                    <h1 className={cn("font-bold text-foreground", isMobile ? "text-lg mt-3 mb-1.5" : "text-xl mt-4 mb-2")} {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className={cn("font-semibold text-foreground", isMobile ? "text-base mt-2.5 mb-1.5" : "text-lg mt-3 mb-2")} {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className={cn("font-semibold text-foreground", isMobile ? "text-sm mt-2 mb-1" : "text-base mt-2 mb-1")} {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className={cn("text-foreground leading-relaxed", isMobile ? "mb-1.5 text-sm" : "mb-2")} {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className={cn("list-disc list-inside text-foreground", isMobile ? "mb-1.5 space-y-0.5 text-sm" : "mb-2 space-y-1")} {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className={cn("list-decimal list-inside text-foreground", isMobile ? "mb-1.5 space-y-0.5 text-sm" : "mb-2 space-y-1")} {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className={cn("text-foreground", isMobile ? "ml-1.5" : "ml-2")} {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-foreground" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic text-foreground" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code className={cn("bg-background/50 rounded font-mono text-foreground", isMobile ? "px-1 py-0.5 text-xs" : "px-1.5 py-0.5 text-sm")} {...props} />
                    ) : (
                      <code className={cn("block bg-background/50 rounded-md font-mono text-foreground overflow-x-auto", isMobile ? "p-2 text-xs mb-1.5" : "p-3 text-sm mb-2")} {...props} />
                    ),
                  pre: ({ node, ...props }) => (
                    <pre className={cn("bg-background/50 rounded-md overflow-x-auto", isMobile ? "p-2 mb-1.5" : "p-3 mb-2")} {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className={cn("border-l-4 border-primary/50 pl-4 italic text-muted-foreground", isMobile ? "my-1.5 text-sm" : "my-2")} {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className={cn("overflow-x-auto", isMobile ? "my-1.5" : "my-2")}>
                      <table className="min-w-full border-collapse border border-border" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-muted" {...props} />
                  ),
                  tbody: ({ node, ...props }) => (
                    <tbody {...props} />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr className="border-b border-border" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className={cn("border border-border text-left font-semibold text-foreground", isMobile ? "px-2 py-1.5 text-xs" : "px-3 py-2")} {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className={cn("border border-border text-foreground", isMobile ? "px-2 py-1.5 text-xs" : "px-3 py-2")} {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className={cn("border-border", isMobile ? "my-3" : "my-4")} {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {message.reasoning && message.reasoning.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger className={cn("flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors", isMobile ? "text-[10px] gap-1" : "text-xs gap-2")}>
              <ChevronDown className={cn("transition-transform", isMobile ? "w-2.5 h-2.5" : "w-3 h-3", isOpen && "rotate-180")} />
              <span>Quá trình suy luận ({message.reasoning.length} bước)</span>
            </CollapsibleTrigger>
            <CollapsibleContent className={cn("space-y-2", isMobile ? "mt-1.5" : "mt-2")}>
              {message.reasoning.map((step) => {
                const Icon = reasoningIcons[step.type];
                const StatusIcon = statusIcons[step.status];
                return (
                  <div
                    key={step.id}
                    className={cn("bg-background border border-border rounded-lg space-y-1", isMobile ? "p-2" : "p-3")}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn("text-primary", isMobile ? "w-3.5 h-3.5" : "w-4 h-4")} />
                      <span className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>{step.title}</span>
                      <StatusIcon
                        className={cn(
                          "ml-auto",
                          isMobile ? "w-3.5 h-3.5" : "w-4 h-4",
                          step.status === "completed" && "text-success",
                          step.status === "error" && "text-destructive",
                          (step.status === "pending" || step.status === "processing") && "text-muted-foreground animate-spin"
                        )}
                      />
                    </div>
                    {step.details && (
                      <p className={cn("text-muted-foreground", isMobile ? "text-[10px] pl-5" : "text-xs pl-6")}>{step.details}</p>
                    )}
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        <span className={cn("text-muted-foreground px-2", isMobile ? "text-[10px]" : "text-xs")}>
          {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {isUser && (
        <div className={cn("rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium flex-shrink-0", isMobile ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm")}>
          {message.role[0].toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
