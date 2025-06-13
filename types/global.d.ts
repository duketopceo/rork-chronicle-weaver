export type ChronicleDebugState = {
  callCount: number;
  apiCallHistory: ApiCall[];
  performanceMetrics?: {
    timestamp: number;
    memoryUsage: number;
    renderTime: number;
    apiLatency: number;
    frameRate: number;
    networkStatus: string;
    batteryLevel: number;
  };
  systemInfo?: {
    os: string;
    version: string;
  };
  lastPrompt?: string;
  lastResponse?: ApiResponse;
  lastRawResponse?: string;
  lastError?: ApiError;
  lastApiCall?: ApiCall;
};

declare global {
  var __CHRONICLE_DEBUG__: ChronicleDebugState;
}

export type ApiCompletion<T = unknown> = {
  completion?: string;
  data?: T;
  [key: string]: unknown;
};

export {};
