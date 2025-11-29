/**
 * Type definitions matching backend schemas
 */

export interface Workspace {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export interface UserInfo {
  id: number;
  username: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  workspace_id: number;
  title: string | null;
  created_at: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender: "user" | "assistant";
  content: string;
  created_at: string;
  message_metadata?: Record<string, any>;
}

export interface ChatResponse {
  conversation_id: number;
  answer: string;
  intent?: string;
  plan?: any;
  metadata?: {
    intent?: string;
    needs_plan_approval?: boolean;
  };
}

// Frontend-specific types for UI
export interface FrontendMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  reasoning?: ReasoningStep[];
}

export interface ReasoningStep {
  id: string;
  type: "search" | "history" | "mcp" | "strategy" | "execute" | "intent" | "plan" | "step" | "web_search" | "app_data";
  status: "pending" | "processing" | "completed" | "error";
  title: string;
  details?: string;
  node?: string;
  timestamp?: string;
}

// Streaming event types
export interface StreamEvent {
  event: "node_start" | "node_end" | "intent" | "plan" | "step" | "web_search" | "app_data" | "answer" | "done" | "error";
  data: {
    node?: string;
    intent?: string;
    plan?: any;
    step?: any;
    current_step?: number;
    total_steps?: number;
    results_count?: number;
    has_data?: boolean;
    content?: string;
    conversation_id?: number;
    answer?: string;
    error?: string;
    type?: string;
    timestamp?: string;
  };
}

export interface ConnectedApp {
  id: number;
  workspace_id: number;
  name: string;
  app_id: string;
  app_category: string;
  connection_method: string;
  retailer?: string | null;
  status: string;
  is_default: boolean;
}

export interface SupportedApp {
  id: string;
  name: string;
  category: string; // "POS_SIMPLE" | "ACCOUNTING" | "UNKNOWN"
  connection_method: string; // "api" | "mcp"
  description: string;
  requires_retailer: boolean;
  auth_method: string;
  required_fields: string[];
}

// Helper types for category grouping
export type AppCategory = "POS_SIMPLE" | "ACCOUNTING" | "UNKNOWN";
export type ConnectionMethod = "api" | "mcp";
export type ConnectionStatus = "active" | "inactive" | "connected" | "error";
export type MCPAuthType = "none" | "api_key" | "bearer" | "basic";

// Grouped apps by category
export interface GroupedApps {
  category: AppCategory;
  categoryLabel: string;
  apps: SupportedApp[];
}

// MCP Auth Config types
export interface MCPAuthConfig {
  api_key?: string;
  bearer_token?: string;
  username?: string;
  password?: string;
  [key: string]: any;
}

