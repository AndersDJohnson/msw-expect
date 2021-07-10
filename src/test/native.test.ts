import { rest } from "msw";
import { server } from "..";
import { doFetch } from "./doFetch";

test("native", async () => {
  const handler = jest.fn((_req, res, ctx) =>
    res(ctx.status(200), ctx.json({ message: "ok" }))
  );

  server.use(rest.get(/example\.com/, handler));

  await doFetch();

  expect(handler).toHaveBeenCalledWith(
    expect.objectContaining({
      headers: expect.objectContaining({
        _headers: expect.objectContaining({
          "x-my-header": "one",
        }),
      }),
    }),
    expect.anything(),
    expect.anything()
  );

  expect(handler).toHaveReturnedWith(
    expect(handler.mock.results[0].value).resolves.toEqual(
      expect.objectContaining({
        status: 200,
        body: '{"message":"ok"}',
      })
    )
  );
});
