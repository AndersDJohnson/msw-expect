import { rest } from "msw";
import { setupServer as mswSetupServer } from "msw/node";

export const unmockedHandler = () => {
  throw new Error("Unmocked request");
};

interface Options {
  errorOnUnmocked?: boolean;
}

export const setupServer = (options: Options) => {
  const handlers = options.errorOnUnmocked
    ? [
        rest.get(/.*/, unmockedHandler),
        rest.post(/.*/, unmockedHandler),
        rest.put(/.*/, unmockedHandler),
        rest.delete(/.*/, unmockedHandler),
        rest.options(/.*/, unmockedHandler),
        rest.head(/.*/, unmockedHandler),
      ]
    : [];

  return mswSetupServer(...handlers);
};
