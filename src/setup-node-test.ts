import { server } from "./server";

// Enable API mocking as a side effect, since `node:test` has no global setup hook in older Node versions.
server.listen();

process.once("exit", () => server.close());
