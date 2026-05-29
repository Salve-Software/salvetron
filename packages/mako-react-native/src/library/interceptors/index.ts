import { XHRInterceptor } from './xhr'
import { ReactDevToolsInterceptor } from './react-devtools'
import { JSConsoleInterceptor } from './js-console'

export const xhrInterceptor = XHRInterceptor.getInstance()
export const reactDevToolsInterceptor = ReactDevToolsInterceptor.getInstance()
export const jsConsoleInterceptor = JSConsoleInterceptor.getInstance()
