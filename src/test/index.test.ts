import { rest } from "msw";
import { doFetch, doPost } from "./doFetch";
import { DefaultResponseResolver, mockHandler, server } from "..";

describe("mocks", () => {
  test("expect request without response", async () => {
    const handler = mockHandler();

    server.use(rest.get(/example\.com/, handler as DefaultResponseResolver));

    await doFetch();

    expect(handler.getRequest()).toMatchObject({
      searchParams: {
        myParam: "two",
      },
      headers: {
        "x-my-header": "one",
      },
    });
  });

  test("expect request with response", async () => {
    const realHandler: DefaultResponseResolver = (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ message: "ok" }));

    const handler = mockHandler(realHandler);

    server.use(rest.get(/example\.com/, handler as typeof realHandler));

    await doFetch();

    expect(handler.getRequest()).toMatchObject({
      searchParams: {
        myParam: "two",
      },
      headers: {
        "x-my-header": "one",
      },
    });

    expect(handler.getResponse()).toMatchObject({
      status: 200,
      body: {
        message: "ok",
      },
    });
  });

  test("pairs (for duplicate keys)", async () => {
    const handler = mockHandler();

    server.use(rest.get(/example\.com/, handler as DefaultResponseResolver));

    await doFetch();

    expect(handler.getRequest()).toMatchObject({
      searchParamsPairs: expect.arrayContaining([
        {
          myParam: "one",
        },
        {
          myParam: "two",
        },
      ]),
      headersPairs: expect.arrayContaining([
        {
          "x-my-header": "one",
        },
      ]),
    });

    expect(handler.getResponse()).toMatchObject({
      status: 200,
    });
  });

  test("expect post body", async () => {
    const handler = mockHandler();

    server.use(rest.post(/example\.com/, handler as DefaultResponseResolver));

    await doPost();

    expect(handler.getRequest()).toMatchObject({
      body: {
        myBodyParam: "ok",
      },
    });
  });
});
