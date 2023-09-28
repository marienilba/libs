import { SyncOrAsync } from "@/libs/types";

type XFetchInit = {
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
};

type XFetchInterceptors = {
  interceptors: {
    request?: (
      input: RequestInfo | URL,
      init?: RequestInit
    ) => SyncOrAsync<void>;
    response?: (
      response: Response,
      requestInit: RequestInit
    ) => SyncOrAsync<void>;
  };
};

type XFetch = XFetchInit & XFetchInterceptors;

const XFetch: XFetch = {
  interceptors: {},
};
export default XFetch;

const mergeInit = (XFetchInit: XFetchInit, initialInit: RequestInit = {}) => ({
  ...XFetchInit,
  ...initialInit,
});

export async function xfetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const mergedInit = mergeInit(
    {
      credentials: XFetch.credentials,
      headers: XFetch.headers,
      mode: XFetch.mode,
      referrer: XFetch.referrer,
      referrerPolicy: XFetch.referrerPolicy,
    },
    init
  );
  if (XFetch.interceptors.request)
    await XFetch.interceptors.request(input, mergedInit);

  const request = fetch(input, mergedInit);

  return request.then(async (response) => {
    if (XFetch.interceptors.response)
      await XFetch.interceptors.response(response, mergedInit);
    return response;
  });
}
