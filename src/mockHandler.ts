import { ResponseResolver } from "msw/lib/handlers/createHandler";

type ResponseResolverAsync = (
  ...args: Parameters<ResponseResolver>
) => Promise<ReturnType<ResponseResolver>>;

export const mockHandler = (
  handler: ResponseResolverAsync = async (_req, res, ctx) =>
    res(ctx.status(200))
) => {
  let requests: {}[] = [];
  let responses: ({} | undefined)[] = [];

  const getRequests = () => requests;
  const getResponses = () => responses;

  const getRequest = (index: number = 0) => requests[index];
  const getResponse = (index: number = 0) => responses[index];

  const newHandler: ResponseResolverAsync = async (req, res, ctx) => {
    const searchParamsEntries = [
      ...// @ts-expect-error msw's polyfill doesn't match the global spec types.
      (req.url?.searchParams?.entries() ?? []),
    ];

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
      // For msw@^0.2.0:
      // @ts-expect-error msw's polyfill doesn't match the global spec types.
      typeof req.headers?.getAllHeaders === "function"
        ? // @ts-expect-error msw's polyfill doesn't match the global spec types.
          req.headers?.getAllHeaders()
        : // For msw@^0.3.0:
          // @ts-expect-error msw's polyfill doesn't match the global spec types.
          req.headers?.all();

    requests.push({
      ...req,
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

  // @ts-expect-error These are overrides.
  newHandler.getRequest = getRequest;
  // @ts-expect-error These are overrides.
  newHandler.getResponse = getResponse;
  // @ts-expect-error These are overrides.
  newHandler.getRequests = getRequests;
  // @ts-expect-error These are overrides.
  newHandler.getResponses = getResponses;

  return newHandler;
};
