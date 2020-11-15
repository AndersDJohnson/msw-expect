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
