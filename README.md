# msw-assert

MSW works great to mock responses in unit tests, but it's missing a way to assert on what requests are made like `nock` can. Well, now you can too with `msw-assert` and Jest!

Like `nock`, you can also make tests fail when any non-mocked request occurs to increase reliability and reduce side effects.

Works with TypeScript!

For simplest setup with our built-in MSW server, in your `jest.config.js`:

```js
module.exports = {
  setupFilesAfterEnv: ["msw-assert/setup"],
};
```

In your test, you can wrap your MSW handlers with `mockHandler`:

```js
import { rest } from "msw";
import { mockHandler, server } from "msw-assert";

import { myMswHandler } from "./myMswHandler";
import { fetchFlavor } from "./fetchFlavor";

test("fetch flavor called with flavor param", async () => {
  const handler = mockHandler(myMswHandler);

  server.use(rest.get("https://api.example.com/flavors", handler));

  await fetchFlavor();

  expect(handler.getRequest()).toMatchObject({
    searchParams: {
      flavor: "cherry",
    },
  });
});
```

Or, if you don't need to mock the response, you don't need to provide a handler to wrap (the default just responds with 200):

```js
const handler = mockHandler();
```

You can also assert on request URL, body, headers, etc., with `getRequest()` as well as response status, body, etc., with `getResponse()`:

```js
server.use(rest.post("https://api.example.com/flavors", handler));

await postFlavor();

expect(handler.getRequest()).toMatchObject({
  url: "https://api.example.com/flavors",
  headers: {
    "x-api-key": "123",
  },
  body: {
    flavor: "cherry",
  },
});

expect(handler.getResponse()).toMatchObject({
  status: 200,
  body: {
    flavor: "cherry",
  },
});
```

You can use any of the [Jest assertion utilities](https://jestjs.io/docs/en/expect), including deeply nested `expect.stringMatching(regex)`, `expect.arrayContaining(array)`, etc.

To assert multiple requests and responses, use `getRequest(index)` and `getResponse(index)`:

```js
// Assert on the 2nd request (1st index):

expect(handler.getRequest(1)).toMatchObject({
  searchParams: {
    flavor: "imaginary",
  },
});

// Assert on the 3rd response (2nd index):

expect(handler.getResponse(2)).toMatchObject({
  status: 404,
});
```

To assert count of requests, use `getRequests()`:

```js
expect(handler.getRequests()).toHaveLength(3);
```

## Manual Server

If you prefer to configure your server manually, instead of using `msw-assert/setup` in your Jest config, create the server as follows.
Note: This also allows you to opt-in to throw errors when any non-mocked request occurs, define global handlers, etc.:

```js
import { setupServer } from "msw-assert";

export const server = setupServer({
  errorOnNonMocked: true, // default: false
  handlers: [], // optional
});
```
