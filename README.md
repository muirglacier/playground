[![CI](https://github.com/DeFiCh/playground/actions/workflows/ci.yml/badge.svg)](https://github.com/DeFiCh/playground/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/DeFiCh/playground/branch/main/graph/badge.svg?token=kBCC9qSRrA)](https://codecov.io/gh/DeFiCh/playground)
[![Maintainability](https://api.codeclimate.com/v1/badges/c206ba9a4fdf0699229c/maintainability)](https://codeclimate.com/github/DeFiCh/playground/maintainability)
[![TS-Standard](https://badgen.net/badge/code%20style/ts-standard/blue?icon=typescript)](https://github.com/standard/ts-standard)

# DeFi Playground

DeFi playground for DeFi Blockchain engineers to build DeFi applications without running your own node.

## Running DeFi Playground

`docker-compose.yml`

```yaml
version: '3.7'

services:
  traefik:
    image: traefik:v2.4
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:3000"
    ports:
      - "3000:3000"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

  defi-blockchain:
    image: defi/defichain:1.7.0
    command: >
      defid
      -printtoconsole
      -rpcallowip=0.0.0.0/0
      -rpcbind=0.0.0.0
      -rpcuser=playground-rpcuser
      -rpcpassword=playground-rpcpassword
      -masternode_operator=mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy
      -regtest=1
      -txnotokens=0
      -logtimemicros
      -txindex=1
      -acindex=1
      -amkheight=0
      -bayfrontheight=1
      -bayfrontgardensheight=2
      -clarkequayheight=3
      -dakotaheight=4
      -dakotacrescentheight=5
      -eunosheight=6

  defi-whale:
    image: ghcr.io/defich/whale:latest
    depends_on:
      - defi-blockchain
    environment:
      WHALE_DEFID_URL: http://playground-rpcuser:playground-rpcpassword@defi-blockchain:19554
      WHALE_DATABASE_PROVIDER: memory
      WHALE_NETWORK: playground
    labels:
      - "traefik.http.routers.whale.priority=1"
      - "traefik.http.routers.whale.rule=PathPrefix(`/{version:v[1-9]}/playground/`)"
      - "traefik.http.routers.whale.entrypoints=web"
      - "traefik.http.services.whale.loadbalancer.server.port=3000"

  defi-playground:
    image: ghcr.io/defich/playground:latest
    depends_on:
      - defi-blockchain
    environment:
      PLAYGROUND_DEFID_URL: http://playground-rpcuser:playground-rpcpassword@defi-blockchain:19554
    labels:
      - "traefik.http.routers.playground.priority=0"
      - "traefik.http.routers.playground.rule=PathPrefix(`/{version:v[1-9]}/playground/rpc/`)"
      - "traefik.http.routers.playground.entrypoints=web"
      - "traefik.http.services.playground.loadbalancer.server.port=3000"
```

## Developing & Contributing

Thanks for contributing, appreciate all the help we can get. Feel free to make a pull-request, we will guide you along
the way to make it merge-able. Here are some of our documented [contributing guidelines](CONTRIBUTING.md).

You need `node v14`, and `npm v7` for this project, it's required to set
up [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

```shell
npm install
```

### Testing

There are three types of tests required for DeFi Playground.

All types of tests required Docker
as [`@muirglacier/testcontainers`](https://github.com/DeFiCh/jellyfish/tree/main/packages/testcontainers) will
automatically spin up `regtest` instances for testing. The number of containers it will spin up concurrently is
dependent on your jest `--maxConcurrency` count. Test are known to be flaky due to the usage of multiple Docker
containers for test concurrency.

#### Unit Testing

Unit testing are created to test each individual units/components of a software. As they are unit tests, they should be
closely co-located together with the unit. They follow the naming semantic of `*.spec.ts` and placed together in the
same directory of the code you are testing. Code coverage is collected for this.

#### End-to-end Testing

On top of unit tests, this provides additional testing that tests the entire lifecycle of DeFi playground. All
dependencies and modules are integrated together as expected. They follow the naming semantic of `*.e2e.ts` and placed
in the same directory as the component. Code coverage is collected for this.

For endpoints that are meant to be consumed by developer, the testing should be done in `playground-api-cient`.
Dogfooding at its finest, tests should be written in `packages/playground-api-client/__tests__` to test the e2e aspect
of each endpoint.

#### Code coverage

Coverage is collected for unit and e2e tests at each pull request to main with `codecov`; more testing 🚀 less 🐛 = 😎

```shell
jest
```

### Publishing

Docker images are published automatically to GitHub Container Registry (ghcr.io/defich). When a
new [GitHub releases](https://github.com/DeFiCh/playground/releases) is triggered, GitHub Action will automatically
build the docker image in this repo and publish it. Two images are created for each release targeting `linux/amd64`
and `linux/arm64`. The latest tag will always be updated with the last release and semantic release is enforced for each
release.

### IntelliJ IDEA

IntelliJ IDEA is the IDE of choice for writing and maintaining this library. IntelliJ's files are included for
convenience with basic toolchain setup but use of IntelliJ is totally optional.

### Security issues

If you discover a security vulnerability in `DeFi Playground`,
[please see submit it privately](https://github.com/DeFiCh/.github/blob/main/SECURITY.md).

## License & Disclaimer

By using `DeFi Playground` (this repo), you (the user) agree to be bound by [the terms of this license](LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FDeFiCh%2Fplayground.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FDeFiCh%2Fplayground?ref=badge_large)
