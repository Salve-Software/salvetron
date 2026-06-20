import { NetworkHandler } from '../index';

import * as utils from '../utils';

jest.mock('../utils');

describe('NetworkHandler', () => {
  const onEvent = jest.fn();

  const config = {
    ignoredUrls: [],
    onEvent,
  };

  let handler: NetworkHandler;
  let callbacks: ReturnType<NetworkHandler['getCallbacks']>;
  let xhr: XMLHttpRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    handler = new NetworkHandler(config);
    callbacks = handler.getCallbacks();

    xhr = {} as XMLHttpRequest;

    jest
      .spyOn(utils, 'generateRequestId')
      .mockReturnValue('request-id');

    jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1500);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create pending request on open', () => {
    jest
      .spyOn(utils, 'shouldIgnoreUrl')
      .mockReturnValue(false);

    callbacks.onOpen(
      'GET',
      'https://api.com',
      xhr,
    );

    callbacks.onSend(undefined, xhr);

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: 'request',
        requestId: 'request-id',
        method: 'GET',
        url: 'https://api.com',
      }),
    );
  });

  it('should ignore urls that match ignored patterns', () => {
    jest
      .spyOn(utils, 'shouldIgnoreUrl')
      .mockReturnValue(true);

    callbacks.onOpen(
      'GET',
      'https://ignored.com',
      xhr,
    );

    callbacks.onSend(undefined, xhr);

    expect(onEvent).not.toHaveBeenCalled();
  });

  it('should attach request headers', () => {
    jest
      .spyOn(utils, 'shouldIgnoreUrl')
      .mockReturnValue(false);

    callbacks.onOpen(
      'POST',
      'https://api.com',
      xhr,
    );

    callbacks.onRequestHeader(
      'Authorization',
      'Bearer token',
      xhr,
    );

    callbacks.onSend(undefined, xhr);

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token',
        },
      }),
    );
  });

  it('should attach request body', () => {
    jest
      .spyOn(utils, 'shouldIgnoreUrl')
      .mockReturnValue(false);

    callbacks.onOpen(
      'POST',
      'https://api.com',
      xhr,
    );

    callbacks.onSend(
      { name: 'Gabriel' },
      xhr,
    );

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        body: JSON.stringify({
          name: 'Gabriel',
        }),
      }),
    );
  });

  it('should parse response headers', () => {
    jest
      .spyOn(utils, 'shouldIgnoreUrl')
      .mockReturnValue(false);

    jest
      .spyOn(utils, 'parseResponseHeaders')
      .mockReturnValue({
        'content-type': 'application/json',
      });

    callbacks.onOpen(
      'GET',
      'https://api.com',
      xhr,
    );

    callbacks.onHeaderReceived(
      undefined,
      undefined,
      'Content-Type: application/json',
      xhr,
    );

    callbacks.onResponse(
      200,
      false,
      'ok',
      'https://api.com',
      'text',
      xhr,
    );

    expect(onEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        headers: {
          'content-type':
            'application/json',
        },
      }),
    );
  });

  it('should emit response event', () => {
    jest
      .spyOn(utils, 'shouldIgnoreUrl')
      .mockReturnValue(false);

    jest
      .spyOn(utils, 'responseToString')
      .mockReturnValue('response body');

    callbacks.onOpen(
      'GET',
      'https://api.com',
      xhr,
    );

    callbacks.onSend(undefined, xhr);

    callbacks.onResponse(
      200,
      false,
      'response',
      'https://api.com',
      'text',
      xhr,
    );

    expect(onEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        stage: 'response',
        statusCode: 200,
        body: 'response body',
        duration: 500,
      }),
    );
  });

  it('should handle blob responses', async () => {
    jest
      .spyOn(utils, 'shouldIgnoreUrl')
      .mockReturnValue(false);

    jest
      .spyOn(utils, 'readBlobAsText')
      .mockResolvedValue('blob content');

    callbacks.onOpen(
      'GET',
      'https://api.com',
      xhr,
    );

    callbacks.onResponse(
      200,
      false,
      new Blob(['hello']),
      'https://api.com',
      'blob',
      xhr,
    );

    await Promise.resolve();

    expect(utils.readBlobAsText)
      .toHaveBeenCalled();

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'blob content',
      }),
    );
  });

  it('should clear pending requests', () => {
    jest
      .spyOn(utils, 'shouldIgnoreUrl')
      .mockReturnValue(false);

    callbacks.onOpen(
      'GET',
      'https://api.com',
      xhr,
    );

    handler.clear();

    callbacks.onSend(undefined, xhr);

    expect(onEvent).not.toHaveBeenCalled();
  });
});
