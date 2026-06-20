/**
 * Project Info Event
 * Sent when project connects to RN TUI
 */

export interface ProjectInfoEvent {
  type: 'project_info';
  projectId: string;
  appName: string;
  bundleId: string;
}
