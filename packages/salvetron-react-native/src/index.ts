import { NitroModules } from 'react-native-nitro-modules'
import type { NitroRnTuiSdk as NitroRnTuiSdkSpec } from './specs/rn-tui-sdk.nitro'

export const NitroRnTuiSdk =
  NitroModules.createHybridObject<NitroRnTuiSdkSpec>('NitroRnTuiSdk')

export { default } from './library'
