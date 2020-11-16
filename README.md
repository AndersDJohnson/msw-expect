# msw-expect

MSW works great to mock responses in unit tests, but it's missing a way to assert on what requests are made like `nock` can. Well, now you can too with `msw-expect` and Jest!

Like `nock`, you can also make tests fail when any non-mocked request occurs to increase reliability and reduce side effects (see [Manual Server](https://andersdjohnson.github.io/msw-expect/#manual-server)).

Works with TypeScript!

[Read the docs](https://andersdjohnson.github.io/msw-expect/).
