import fetch from "node-fetch";

export const doFetch = () =>
  fetch("https://example.com?myParam=one&myParam=two", {
    headers: {
      "x-my-header": "one",
      "x-other": "whatever",
    },
  });

export const doPost = () =>
  fetch("https://example.com?myParam=one&myParam=two", {
    method: "post",
    body: '{"myBodyParam":"ok"}',
    headers: {
      "content-type": "application/json",
      "x-my-header": "one",
      "x-other": "whatever",
    },
  });
