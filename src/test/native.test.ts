import { rest } from "msw";
import { server } from "..";
import { DefaultResponseResolver } from "../mockHandler";
import { doFetch } from "./doFetch";

test("native", async () => {
  const realHandler: DefaultResponseResolver = (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: "ok" }));
  };

  const handler = jest.fn(realHandler);

  server.use(rest.get(/example\.com/, handler));

  await doFetch();

  expect(handler.mock.calls[0][0].headers.all()).toEqual(
    expect.objectContaining({
      "x-my-header": "one",
    })
  );

  expect(handler.mock.results[0].value).resolves.toEqual(
    expect.objectContaining({
      status: 200,
      body: '{"message":"ok"}',
    })
  );
});

