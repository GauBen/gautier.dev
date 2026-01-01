FROM debian:13-slim AS build
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update \
  && apt-get -y --no-install-recommends install curl ca-certificates gpg-agent \
  && rm -rf /var/lib/apt/lists/*

ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
RUN curl https://mise.run | sh

WORKDIR /build

ENV MISE_TRUSTED_CONFIG_PATHS="/build/mise.toml"
COPY mise.toml ./
RUN mise install

COPY package.json yarn.lock .yarnrc.yml ./
RUN mise exec -- yarn install

COPY . .
RUN mise exec -- yarn build

FROM gcr.io/distroless/cc-debian13:nonroot

EXPOSE 3000

# Distroless `:nonroot` uses uid/gid 65532.
COPY --from=build --chown=65532:65532 /build/build/app /app
ENTRYPOINT ["/app"]
