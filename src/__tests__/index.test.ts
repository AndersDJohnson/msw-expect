import { rest } from "msw";
import { server } from "../../mswServer";
import { doFetch } from "..";
import { wrapHandler } from "../wrapHandler";

test("mocks", async () => {
  const { handler, requested } = wrapHandler((_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ message: "ok" }))
  );

  server.use(rest.get(/example\.com/, handler));

  await doFetch();

  expect(requested).toHaveBeenCalledWith(
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

  expect(await handler.mock.results[0].value).toMatchObject({
    status: 200,
    bodyParsed: {
      message: "ok",
    },
  });
});

test("pairs (for duplicate keys)", async () => {
  const { handler, requested } = wrapHandler((_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ message: "ok" }))
  );

  server.use(rest.get(/example\.com/, handler));

  await doFetch();

  expect(requested).toHaveBeenCalledWith(
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

  expect(await handler.mock.results[0].value).toMatchObject({
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
