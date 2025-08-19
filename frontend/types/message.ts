export interface ChatMessage {
  _id: string;
  leadId: string;
  senderId: { _id: string; username: string; email: string } | string;
  content: string;
  timestamp: string;
  readStatus: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}
