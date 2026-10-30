import { http, HttpResponse } from "msw";

export type DefaultResponseResolver = Parameters<typeof http.post>[1];

export const mockHandler = (
  handler: DefaultResponseResolver = () => new HttpResponse(null, { status: 200 })
) => {
  let requests: {}[] = [];
  let responses: ({} | undefined)[] = [];

  const getRequests = () => requests;
  const getResponses = () => responses;

  const getRequest = (index: number = 0) => requests[index];
  const getResponse = (index: number = 0) => responses[index];

  const resetRequests = () => requests = [];
  const resetResponses = () => responses = [];
  const reset = () => {
    resetRequests();
    resetResponses();
  }

  type MockResponseResolver = DefaultResponseResolver & {
    getRequest: typeof getRequest;
    getResponse: typeof getResponse;
    getRequests: typeof getRequests;
    getResponses: typeof getResponses;
    reset: typeof reset;
  };

  const newHandler = (async (info: Parameters<DefaultResponseResolver>[0]) => {
    const request = info.request;
    const searchParamsEntries = [
      ...new URL(request.url).searchParams.entries(),
    ];

    const searchParamsPairs = searchParamsEntries.map(([name, value]) => ({
      [name]: value,
    }));

    const searchParams = Object.fromEntries(searchParamsEntries);

    const headersPairs: Record<string, string>[] = [];
    const headersMap: Record<string, string> = {};
    request.headers.forEach((value, name) => {
      headersPairs.push({ [name]: value });
      headersMap[name] = value;
    });

    let body: any = await request.clone().text();
    try {
      body = JSON.parse(body);
    } catch {}

    requests.push({
      ...request,
      url: request.url,
      method: request.method,
      body,
      headers: headersMap,
      headersPairs,
      searchParams,
      searchParamsPairs,
    });

    const handled = await handler(info);

    if (!(handled instanceof Response)) {
      responses.push(undefined);
      return handled;
    }

    const responseBody = await handled.clone().text();
    const newHandled: Record<string, any> = {
      ...handled,
      status: handled.status,
      statusText: handled.statusText,
      headers: handled.headers,
      body: responseBody,
    };

    if (
      newHandled.body &&
      newHandled.headers?.get("content-type")?.includes("json")
    ) {
      try {
        newHandled.rawBody = newHandled.body;
        newHandled.body = JSON.parse(newHandled.body);
      } catch {
        // silence
      }
    }

    responses.push(newHandled);

    return handled;
  }) as MockResponseResolver;

  newHandler.getRequest = getRequest;
  newHandler.getResponse = getResponse;
  newHandler.getRequests = getRequests;
  newHandler.getResponses = getResponses;
  newHandler.reset = reset;

  return newHandler;
};
