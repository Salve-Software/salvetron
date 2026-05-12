export interface JSLog {
  deviceId: string;
  level: string;
  message: string;
  metadata: Record<string, unknown>;
  source: string;
  timestamp: number;
  type: string;
  projectId?: string;
}
