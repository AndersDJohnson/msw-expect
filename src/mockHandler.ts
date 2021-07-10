import { MockedRequest, ResponseResolver, rest } from "msw";

type ContextType = Parameters<Parameters<typeof rest.get>[1]>[2];

export const mockHandler = (
  handler: ResponseResolver<MockedRequest, ContextType> = (_req, res, ctx) =>
    res(ctx.status(200))
) => {
  let requests: {}[] = [];
  let responses: ({} | undefined)[] = [];

  const getRequests = () => requests;
  const getResponses = () => responses;

  const getRequest = (index: number = 0) => requests[index];
  const getResponse = (index: number = 0) => responses[index];

  const newHandler = async (req: MockedRequest, res: any, ctx: ContextType) => {
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

  newHandler.getRequest = getRequest;
  newHandler.getResponse = getResponse;
  newHandler.getRequests = getRequests;
  newHandler.getResponses = getResponses;

  return newHandler;
};
