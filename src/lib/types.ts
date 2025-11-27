/**
 * Type definitions matching backend schemas
 */

export interface Workspace {
  id: number;
  name: string;
  owner_id: number;
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
  type: "search" | "history" | "mcp" | "strategy" | "execute";
  status: "pending" | "processing" | "completed" | "error";
  title: string;
  details?: string;
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
  category: string;
  connection_method: string;
  description: string;
  requires_retailer: boolean;
  auth_method: string;
  required_fields: string[];
}

