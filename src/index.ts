import fetch, { Headers } from "node-fetch";

export const doFetch = () => {
  const headers = new Headers();

  return fetch("https://example.com?myParam=one&myParam=two", {
    headers: {
      "x-my-header": "one",
    },
  });
};
