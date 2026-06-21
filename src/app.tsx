/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Box, useInput } from 'ink'
import { useMemo, useState } from 'react'
import { AsciiLogo, pickRandomColor } from './shared/components/ascii-logo/index.js'
import { TabBar } from './shared/components/tab-bar/index.js'
import { StatusBar } from './shared/components/status-bar/index.js'
import { useProject } from './shared/store/device.store.js'
import { useIsSearchBarOpen } from './shared/store/search-bar.store.js'
import { DashboardContainer } from './modules/dashboard/ui/containers/dashboard-container/index.js'
import { JsLogsContainer } from './modules/js-logs/ui/containers/js-logs-container/index.js'
import { NetworkContainer } from './modules/network/ui/containers/network-container/index.js'
import { NativeLogsContainer } from './modules/native-logs/ui/containers/native-logs-container/index.js'

export type Tab = 'dashboard' | 'js-logs' | 'network' | 'native'

const TABS: Tab[] = ['dashboard', 'js-logs', 'network', 'native']
const DEFAULT_LOGO_COLOR = '#61DAFB'

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const appName = useProject()?.appName
  const isSearchBarOpen = useIsSearchBarOpen()

  const logoColor = useMemo(
    () => (appName ? pickRandomColor() : DEFAULT_LOGO_COLOR),
    [appName],
  )

  useInput((input, key) => {
    if (isSearchBarOpen) return
    if (input === '1') setActiveTab('dashboard')
    if (input === '2') setActiveTab('js-logs')
    if (input === '3') setActiveTab('network')
    if (input === '4') setActiveTab('native')
    if (key.tab) {
      const i = TABS.indexOf(activeTab)
      setActiveTab(TABS[(i + 1) % TABS.length])
    }
  })

  return (
    <Box flexDirection="column" height="100%" paddingTop={1}>
      <AsciiLogo color={logoColor} />
      <TabBar active={activeTab} />
      <Box flexGrow={1} flexDirection="column" paddingX={1}>
        {activeTab === 'dashboard'
          ? <DashboardContainer />
          : null
        }
        {activeTab === 'js-logs'
          ? <JsLogsContainer />
          : null
        }
        {activeTab === 'network'
          ? <NetworkContainer />
          : null
        }
        {activeTab === 'native'
          ? <NativeLogsContainer />
          : null
        }
      </Box>
      <StatusBar />
    </Box>
  )
}
