import type { NetworkCallbacks } from '../types';

export class XHRInterceptor {
  private static instance: XHRInterceptor | null = null;

  private readonly originalOpen = XMLHttpRequest.prototype.open;
  private readonly originalSend = XMLHttpRequest.prototype.send;
  private readonly originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  private enabled = false;

  private callbacks: {
    onOpen?: NetworkCallbacks['onOpen'];
    onSend?: NetworkCallbacks['onSend'];
    onRequestHeader?: NetworkCallbacks['onRequestHeader'];
    onHeaderReceived?: NetworkCallbacks['onHeaderReceived'];
    onResponse?: NetworkCallbacks['onResponse'];
  } = {};

  public static getInstance(): XHRInterceptor {
    if (!XHRInterceptor.instance) {
      XHRInterceptor.instance = new XHRInterceptor();
    }

    return XHRInterceptor.instance;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public enable(callbacks: NetworkCallbacks): boolean {
    if (this.enabled) {
      console.warn('[Mako] Network interceptor already enabled');
      return false;
    }

    this.callbacks = callbacks;

    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL
    ) {
      XHRInterceptor.getInstance().callbacks.onOpen?.(method, url.toString(), this);

      return XHRInterceptor.getInstance().originalOpen.apply(this, arguments as any);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (
      this: XMLHttpRequest,
      header: string,
      value: string
    ) {
      XHRInterceptor.getInstance().callbacks.onRequestHeader?.(header, value, this);

      return XHRInterceptor.getInstance().originalSetRequestHeader.apply(
        this,
        arguments as any
      );
    };

    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, data?: unknown) {
      const interceptor = XHRInterceptor.getInstance();

      interceptor.callbacks.onSend?.(data, this);

      if (this.addEventListener) {
        this.addEventListener('readystatechange', () => {
          if (!interceptor.enabled) {
            return;
          }

          if (this.readyState === this.HEADERS_RECEIVED) {
            const contentType = this.getResponseHeader('Content-Type');
            const contentLength = this.getResponseHeader('Content-Length');

            interceptor.callbacks.onHeaderReceived?.(
              contentType?.split(';')[0],
              contentLength ? parseInt(contentLength, 10) : undefined,
              this.getAllResponseHeaders(),
              this
            );
          }

          if (this.readyState === this.DONE) {
            interceptor.callbacks.onResponse?.(
              this.status,
              this.timeout > 0,
              this.response,
              this.responseURL,
              this.responseType,
              this
            );
          }
        });
      }

      return interceptor.originalSend.apply(this, arguments as any);
    };

    this.enabled = true;

    console.log('[Mako] Network interception enabled (XMLHttpRequest monkey-patch)');

    return true;
  }

  public disable(): void {
    if (!this.enabled) {
      return;
    }

    XMLHttpRequest.prototype.open = this.originalOpen;
    XMLHttpRequest.prototype.send = this.originalSend;
    XMLHttpRequest.prototype.setRequestHeader = this.originalSetRequestHeader;

    this.callbacks = {};
    this.enabled = false;

    console.log('[Mako] Network interception disabled');
  }
}
