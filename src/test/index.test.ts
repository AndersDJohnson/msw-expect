import { describe, expect, test } from "@jest/globals";
import { http, HttpResponse } from "msw";
import { doFetch, doPost } from "./doFetch";
import { DefaultResponseResolver, mockHandler, server } from "..";

describe("mocks", () => {
  test("expect request without response", async () => {
    const handler = mockHandler();

    server.use(http.get(/example\.com/, handler as DefaultResponseResolver));

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
    const realHandler: DefaultResponseResolver = () =>
      HttpResponse.json({ message: "ok" });

    const handler = mockHandler(realHandler);

    server.use(http.get(/example\.com/, handler as typeof realHandler));

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

    server.use(http.get(/example\.com/, handler as DefaultResponseResolver));

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

    server.use(http.post(/example\.com/, handler as DefaultResponseResolver));

    await doPost();

    expect(handler.getRequest()).toMatchObject({
      body: {
        myBodyParam: "ok",
      },
    });
  });

  test("it should be possible to reset requests/responses", async () => {
    const handler = mockHandler();

    server.use(http.post(/example\.com/, handler as DefaultResponseResolver));
    await doPost();
    await doPost();
    expect(handler.getRequests()).toHaveLength(2);
    expect(handler.getResponses()).toHaveLength(2);
    handler.reset();
    expect(handler.getRequests()).toHaveLength(0);
    expect(handler.getResponses()).toHaveLength(0);
  })
});
