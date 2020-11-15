import { rest } from "msw";
import { setupServer as mswSetupServer } from "msw/node";

export const unmockedHandler = () => {
  throw new Error("Unmocked request");
};

interface Options {
  errorOnNonMocked?: boolean;
  handlers?: Parameters<typeof mswSetupServer>;
}

export const setupServer = (options: Options) => {
  const defaultHandlers = options.errorOnNonMocked
    ? [
        rest.get(/.*/, unmockedHandler),
        rest.post(/.*/, unmockedHandler),
        rest.put(/.*/, unmockedHandler),
        rest.delete(/.*/, unmockedHandler),
        rest.options(/.*/, unmockedHandler),
        rest.head(/.*/, unmockedHandler),
      ]
    : [];

  const handlers = [...(options.handlers ?? []), ...defaultHandlers];

  return mswSetupServer(...handlers);
};
