import { expect, jest, test } from "@jest/globals";
import { http, HttpResponse } from "msw";
import { server } from "..";
import { DefaultResponseResolver } from "../mockHandler";
import { doFetch } from "./doFetch";

test("native", async () => {
  const realHandler: DefaultResponseResolver = () =>
    HttpResponse.json({ message: "ok" });

  const handler = jest.fn(realHandler);

  server.use(http.get(/example\.com/, handler));

  await doFetch();

  expect(
    handler.mock.calls[0][0].request.headers.get("x-my-header")
  ).toEqual("one");

  expect(handler.mock.results[0].value).toEqual(
    expect.objectContaining({
      status: 200,
    })
  );
});
