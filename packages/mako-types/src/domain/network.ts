/**
 * Network Log Domain Type
 * Stored representation of a network request in Mako
 */

export interface NetworkLog {
  body: string | null;
  deviceId: string;
  headers: Record<string, string>;
  method: string;
  requestId: string;
  stage: string;
  timestamp: number;
  type: string;
  url: string;
  projectId?: string;
}
