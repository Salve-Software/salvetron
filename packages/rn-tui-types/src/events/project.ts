/**
 * Project Info Event
 * Sent when project connects to Mako
 */

export interface ProjectInfoEvent {
  type: 'project_info';
  projectId: string;
  appName: string;
  bundleId: string;
}
