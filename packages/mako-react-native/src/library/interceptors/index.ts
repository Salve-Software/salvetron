import { XHRInterceptor } from './xhr'
import { ReactDevToolsInterceptor } from './react-devtools'

export const xhrInterceptor = XHRInterceptor.getInstance()
export const reactDevToolsInterceptor = ReactDevToolsInterceptor.getInstance()
