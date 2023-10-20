import { rest } from "msw";

export type DefaultResponseResolver = Parameters<typeof rest.post>[1];

export const mockHandler = (
  handler: DefaultResponseResolver = (_req, res, ctx) => res(ctx.status(200))
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

  const newHandler = async (
    req: Parameters<DefaultResponseResolver>[0],
    res: Parameters<DefaultResponseResolver>[1],
    ctx: Parameters<DefaultResponseResolver>[2]
  ) => {
    const searchParamsEntries = [...(req.url?.searchParams?.entries() ?? [])];

    const searchParamsPairs = searchParamsEntries?.map(([name, value]) => ({
      [name]: value,
    }));

    const searchParams = searchParamsEntries
      ? Object.fromEntries(searchParamsEntries)
      : undefined;

    const headersPairs: Record<string, string>[] = [];
    req.headers?.forEach((value, name) => {
      headersPairs.push({ [name]: value });
    }, req.headers);

    const headersMap =
      // @ts-expect-error For msw@<0.28.0:
      typeof req.headers?.getAllHeaders === "function"
        ? // @ts-expect-error For msw@<0.28.0:
          req.headers?.getAllHeaders()
        : // For msw@>=0.28.0:
          req.headers?.all();

    let body = await req.text();
    try {
      body = JSON.parse(body);
    } catch {}

    requests.push({
      ...req,
      body,
      headers: headersMap,
      headersPairs,
      searchParams,
      searchParamsPairs,
    });

    const handled = await handler(req, res, ctx);

    if (!handled) {
      responses.push(undefined);
      return handled;
    }

    const newHandled: Record<string, any> = { ...handled };

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
  };

  newHandler.getRequest = getRequest;
  newHandler.getResponse = getResponse;
  newHandler.getRequests = getRequests;
  newHandler.getResponses = getResponses;
  newHandler.reset = reset;

  return newHandler;
};
