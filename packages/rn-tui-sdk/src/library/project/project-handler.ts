import { deviceHandler } from '../device'
import type { ProjectInfoEvent } from '../types'

export class ProjectHandler {
  private cachedProjectId: string | null = null

  getProjectId(): string {
    if (this.cachedProjectId) {
      return this.cachedProjectId
    }
    // Use bundleId as projectId - it's already unique per app
    const bundleId = deviceHandler.getBundleId()
    this.cachedProjectId = bundleId
    return bundleId
  }

  getProjectInfo(): Omit<ProjectInfoEvent, 'type'> {
    const projectId = this.getProjectId()
    const appName = deviceHandler.getAppName()
    const bundleId = deviceHandler.getBundleId()

    return {
      projectId,
      appName,
      bundleId,
    }
  }
}
