import { NitroModules } from 'react-native-nitro-modules'
import type { NitroSalvetron as NitroSalvetronSpec } from './specs/salvetron.nitro'

export const NitroSalvetron =
  NitroModules.createHybridObject<NitroSalvetronSpec>('NitroSalvetron')

export { default } from './library'
