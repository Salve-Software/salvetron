import { spawnSync } from 'node:child_process'

interface ClipTool { cmd: string; args: string[] }

function getClipboardTools(): ClipTool[] {
  switch (process.platform) {
    case 'darwin':
      return [{ cmd: 'pbcopy', args: [] }]
    case 'win32':
      return [{ cmd: 'clip', args: [] }]
    default:
      return [
        { cmd: 'xclip', args: ['-selection', 'clipboard'] },
        { cmd: 'xsel', args: ['--clipboard', '--input'] },
      ]
  }
}

export function copyToClipboard(text: string): boolean {
  for (const tool of getClipboardTools()) {
    const result = spawnSync(tool.cmd, tool.args, { input: text, encoding: 'utf8' })
    if (result.error) continue
    if (typeof result.status === 'number' && result.status !== 0) continue
    return true
  }
  return false
}
