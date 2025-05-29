export interface GeneratedImage {
  id: string; // Unique ID for the image, e.g., timestamp or transaction signature
  prompt: string;
  imageUrl: string;
  timestamp: Date;
}

export interface CreditPurchaseInfo {
  costSol: number;
  creditsToReceive: number;
  recipientAddress: string;
}

export type StatusMessageType = 'info' | 'success' | 'error' | 'loading';

export interface StatusMessage {
  id: string;
  type: StatusMessageType;
  text: string;
  duration?: number; // Optional: auto-dismiss after duration (ms)
}
