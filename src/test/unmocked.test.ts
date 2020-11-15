import { doFetch } from "./doFetch";

test.skip("fails on unmocked requests (if `errorOnNonMocked` is `true`)", async () => {
  doFetch();

  await new Promise((resolve) => setTimeout(resolve, 5000));
});
