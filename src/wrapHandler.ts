import { MockedRequest, ResponseResolver, rest } from "msw";

type ContextType = Parameters<Parameters<typeof rest.get>[1]>[2];

export const wrapHandler = (
  handler: ResponseResolver<MockedRequest, ContextType, { a: 1 }>
) => async (req: MockedRequest, res: any, ctx: ContextType) => {
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

  console.log("ADJ handled", handled);

  const newHandled = { ...handled };

  // @ts-ignore
  if (newHandled.headers?.get("content-type")?.includes("json")) {
    // @ts-ignore
    newHandled.bodyParsed = JSON.parse(newHandled.body);
  }

  console.log("ADJ newHandled", newHandled);

  return newHandled as typeof handled;
};
