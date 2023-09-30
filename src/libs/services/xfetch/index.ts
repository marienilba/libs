import { SyncOrAsync } from "@/libs/types";

type XFetchInit = {
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
};
type XFetchConfig = {
  baseURL?: string;
} & XFetchInit;

type XFetchInterceptors = {
  request?: (
    input: RequestInfo | URL,
    init: RequestInit
  ) => SyncOrAsync<XFetchInit | void>;
  response?: (
    response: Response,
    requestInit: RequestInit
  ) => SyncOrAsync<void>;
};

const mergeInit = (
  XFetchConfig: XFetchInit,
  initialInit: RequestInit = {}
) => ({
  ...XFetchConfig,
  ...initialInit,
});

const mergeInput = (XFetchConfig: XFetchConfig, input: RequestInfo | URL) => {
  if (!XFetchConfig.baseURL) return input;
  if (input instanceof Request)
    return new Request({ ...input, url: XFetchConfig.baseURL });
  if (input instanceof URL) return input;
  return new URL(input, XFetchConfig.baseURL).toString();
};

export class XFetch {
  config: XFetchConfig;
  interceptors: XFetchInterceptors = {};
  constructor(config: XFetchConfig = {}) {
    this.config = config;
  }

  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let mergedInit = mergeInit(
      {
        credentials: this.config.credentials,
        headers: this.config.headers,
        mode: this.config.mode,
        referrer: this.config.referrer,
        referrerPolicy: this.config.referrerPolicy,
      },
      init
    );
    const mergedInput = mergeInput(this.config, input);
    if (this.interceptors.request) {
      const interceptInit = await this.interceptors.request(
        mergedInput,
        mergedInit
      );

      mergedInit = mergeInit(mergedInit, interceptInit || {});
    }

    const request = fetch(mergedInput, mergedInit);

    return request.then(async (response) => {
      if (this.interceptors.response)
        await this.interceptors.response(response, mergedInit);
      return response;
    });
  }
}
