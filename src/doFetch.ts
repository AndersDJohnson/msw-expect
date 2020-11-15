import fetch from "node-fetch";

export const doFetch = () =>
  fetch("https://example.com?myParam=one&myParam=two", {
    headers: {
      "x-my-header": "one",
      "x-other": "whatever",
    },
  });
