import type { FrontendMessage } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, History, Database, FileText, Zap, CheckCircle2, Loader2, XCircle, Brain, Target } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-a:text-primary prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  h1: ({ node, ...props }) => (
                    <h1 className="text-xl font-bold mt-4 mb-2 text-foreground" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg font-semibold mt-3 mb-2 text-foreground" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-base font-semibold mt-2 mb-1 text-foreground" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-2 text-foreground leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1 text-foreground" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1 text-foreground" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="ml-2 text-foreground" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-foreground" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic text-foreground" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code className="bg-background/50 px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props} />
                    ) : (
                      <code className="block bg-background/50 p-3 rounded-md text-sm font-mono text-foreground overflow-x-auto mb-2" {...props} />
                    ),
                  pre: ({ node, ...props }) => (
                    <pre className="bg-background/50 p-3 rounded-md overflow-x-auto mb-2" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-primary/50 pl-4 italic my-2 text-muted-foreground" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-2">
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
                    <th className="border border-border px-3 py-2 text-left font-semibold text-foreground" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-border px-3 py-2 text-foreground" {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="my-4 border-border" {...props} />
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
