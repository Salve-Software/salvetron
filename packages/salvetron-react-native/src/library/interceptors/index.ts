import { XHRInterceptor } from './xhr'
import { JSConsoleInterceptor } from './js-console'

export const xhrInterceptor = XHRInterceptor.getInstance()
export const jsConsoleInterceptor = JSConsoleInterceptor.getInstance()
