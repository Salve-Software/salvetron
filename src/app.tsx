import { Box, useInput } from 'ink'
import { useState } from 'react'
import { AsciiLogo } from './shared/components/ascii-logo/index.js'
import { TabBar } from './shared/components/tab-bar/index.js'
import { StatusBar } from './shared/components/status-bar/index.js'
import { DashboardContainer } from './modules/dashboard/ui/containers/dashboard-container/index.js'
import { JsLogsContainer } from './modules/js-logs/ui/containers/js-logs-container/index.js'
import { NetworkContainer } from './modules/network/ui/containers/network-container/index.js'
import { NativeLogsContainer } from './modules/native-logs/ui/containers/native-logs-container/index.js'

export type Tab = 'dashboard' | 'js-logs' | 'network' | 'native'

const TABS: Tab[] = ['dashboard', 'js-logs', 'network', 'native']

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  useInput((input, key) => {
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
      <AsciiLogo />
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
