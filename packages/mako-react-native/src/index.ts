import { NitroModules } from 'react-native-nitro-modules'
import type { NitroMako as NitroMakoSpec } from './specs/mako.nitro'

export const NitroMako =
  NitroModules.createHybridObject<NitroMakoSpec>('NitroMako')

export { default } from './library'
