# msw-expect

[MSW](https://mswjs.io/) works great to mock responses in unit tests, but it's missing a way to assert on what requests are made like [`nock`](https://github.com/nock/nock) can. Well, now you can too with `msw-expect` and Jest!

And it works with TypeScript!

## Install

You'll want to install `msw` as well, if you haven't already.

[![npm add -D msw-expect (copy)](https://copyhaste.com/i?t=npm%20add%20-D%20msw-expect)](https://copyhaste.com/c?t=npm%20add%20-D%20msw-expect%20msw "npm add -D msw-expect msw (copy)")

or

[![yarn add -D msw-expect (copy)](https://copyhaste.com/i?t=yarn%20add%20-D%20msw-expect)](https://copyhaste.com/c?t=yarn%20add%20-D%20msw-expect%20msw "yarn add -D msw-expect msw (copy)")

## Use

For simplest setup with our built-in MSW server, in your `jest.config.js`:

```js
module.exports = {
  setupFilesAfterEnv: ["msw-expect/setup"],
};
```

In your test, you can wrap your MSW handlers with `mockHandler`:

```ts
import { rest } from "msw";
import { mockHandler, server } from "msw-expect";

import { myMswHandler } from "./myMswHandler";
import { fetchFlavor } from "./fetchFlavor";

test("fetch flavor called with flavor param", async () => {
  const handler = mockHandler(myMswHandler);

  server.use(
    rest.get(
      "https://api.example.com/flavors",
      // Only use the "as..." part if you're using TypeScript.
      handler as typeof myMswHandler
    )
  );

  await fetchFlavor();

  expect(handler.getRequest()).toMatchObject({
    searchParams: {
      flavor: "cherry",
    },
  });
});
```

Or, if you don't need to mock the response, you don't need to provide a handler to wrap (the default just responds with 200):

```ts
// Only import `DefaultResponseResolver` if you're using TypeScript.
import { DefaultResponseResolver } from "msw-expect";

const handler = mockHandler();

server.use(
  rest.post(
    "https://api.example.com/flavors",
    // Only use the "as..." part if you're using TypeScript.
    handler as DefaultResponseResolver
  )
);
```

You can also assert on request URL, body, headers, etc., with `getRequest()` as well as response status, body, etc., with `getResponse()`:

```ts
server.use(
  rest.post(
    "https://api.example.com/flavors",
    // Only use the "as..." part if you're using TypeScript.
    handler as typeof myMswHandler
  )
);

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

```ts
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

```ts
expect(handler.getRequests()).toHaveLength(3);
```

### Reset request/response arrays between tests

If you want to clear the request/response arrays between tests, use the `reset` method:

```ts
describe('test', () => {
    beforeEach(() => {
        handler.reset()
    });
})
```

### Manual Server

If you prefer to configure your server manually, you do not need to use `msw-expect/setup` in your Jest config.

Instead, you can configure a vanilla MSW server yourself:

```ts
import { setupServer } from "msw/node";

export const server = setupServer();
```

### Contributors

- [Anders D. Johnson](https:/github.com/AndersDJohnson)
- [Ron Derksen](https:/github.com/ronderksen)
