import { rest } from "msw";
import { server } from "../../mswServer";
import { doFetch } from "..";
import { wrapHandler } from "../wrapHandler";

test("mocks", async () => {
  const handler = jest.fn((_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ message: "ok" }))
  );

  const wrappedHandler = jest.fn((_req, res, ctx) =>
    wrapHandler(handler)(_req, res, ctx)
  );

  server.use(rest.get(/example\.com/, wrappedHandler));

  await doFetch();

  expect(handler).toHaveBeenCalledWith(
    expect.objectContaining({
      searchParams: {
        myParam: "two",
      },
      headersMap: expect.objectContaining({
        "x-my-header": "one",
      }),
    }),
    expect.anything(),
    expect.anything()
  );

  expect(wrappedHandler.mock.results[0].value).resolves.toMatchObject({
    status: 200,
    bodyParsed: {
      message: "ok",
    },
  });
});

test("pairs (for duplicate keys)", async () => {
  const handler = jest.fn((_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ message: "ok" }))
  );

  server.use(rest.get(/example\.com/, wrapHandler(handler)));

  await doFetch();

  expect(handler).toHaveBeenCalledWith(
    expect.objectContaining({
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
    }),
    expect.anything(),
    expect.anything()
  );

  expect(handler).toHaveReturnedWith(
    expect.objectContaining({
      status: 200,
    })
  );
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
