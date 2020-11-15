import { rest } from "msw";
import { server } from "../../mswServer";
import { doFetch } from "../doFetch";
import { mockHandler } from "../mockHandler";

test("mocks", async () => {
  const handler = mockHandler((_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ message: "ok" }))
  );

  server.use(rest.get(/example\.com/, handler));

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
  const handler = mockHandler((_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ message: "ok" }))
  );

  server.use(rest.get(/example\.com/, handler));

  await doFetch();

  expect(handler.getRequest(0)).toMatchObject({
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

  expect(handler.getResponse(0)).toMatchObject({
    status: 200,
  });
});

test("native", async () => {
  const handler = jest.fn((_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ message: "ok" }))
  );

  server.use(rest.get(/example\.com/, handler));

  await doFetch();

  expect(handler).toHaveBeenCalledWith(
    expect.objectContaining({
      headers: {
        map: expect.objectContaining({
          "x-my-header": "one",
        }),
      },
    }),
    expect.anything(),
    expect.anything()
  );

  expect(handler).toHaveReturnedWith(
    expect.objectContaining({
      status: 200,
      body: '{"message":"ok"}',
    })
  );
});
