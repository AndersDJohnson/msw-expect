import { MockedRequest, ResponseResolver, rest } from "msw";

type ContextType = Parameters<Parameters<typeof rest.get>[1]>[2];

export const mockHandler = (
  handler: ResponseResolver<MockedRequest, ContextType>
) => {
  let requests: {}[] = [];

  const getRequest = (index: number = 0) => requests[index];

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

    const headersMap = req.headers?.getAllHeaders();

    requests.push({
      ...req,
      headers: headersMap,
      headersPairs,
      searchParams,
      searchParamsPairs,
    });

    const handled = await handler(
      {
        ...req,
        // @ts-ignore
        headersMap,
        headersPairs,
        searchParams,
        searchParamsPairs,
      },
      res,
      ctx
    );

    const newHandled = { ...handled };

    // @ts-ignore
    if (newHandled.headers?.get("content-type")?.includes("json")) {
      // @ts-ignore
      newHandled.bodyParsed = JSON.parse(newHandled.body);
    }

    return newHandled as typeof handled;
  };

  const mocked = jest.fn(newHandler);

  // @ts-ignore
  mocked.getRequest = getRequest;

  const getResponse = (index: number = 0) =>
    mocked.mock.results[index].value as Promise<{}>;

  // @ts-ignore
  mocked.getResponse = getResponse;

  return mocked as typeof mocked & {
    getRequest: typeof getRequest;
    getResponse: typeof getResponse;
  };
};
