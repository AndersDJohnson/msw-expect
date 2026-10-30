import { server } from "./server";

export const globalSetup = () => {
  server.listen();
};

export const globalTeardown = () => {
  server.resetHandlers();
  server.close();
};
