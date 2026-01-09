FROM debian:13-slim@sha256:4bcb9db66237237d03b55b969271728dd3d955eaaa254b9db8a3db94550b1885 AS build
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
WORKDIR /workdir

# Install system dependencies and mise (https://mise.jdx.dev/)
ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/mise/shims:$PATH"
RUN apt-get update && apt-get -y --no-install-recommends install curl ca-certificates gnupg \
  && rm -rf /var/lib/apt/lists/* \
  && gpg --keyserver hkps://keys.openpgp.org --recv-keys 24853EC9F655CE80B48E6C3A8B81C9D17413A06D \
  && curl https://mise.jdx.dev/install.sh.sig | gpg | sh

# Install dev tools via mise
ENV MISE_ALWAYS_KEEP_DOWNLOAD="true"
ENV MISE_TRUSTED_CONFIG_PATHS="/workdir/mise.toml"
COPY mise.toml .
RUN --mount=type=cache,target=/mise/downloads mise install

# Install js dependencies
COPY --exclude=* --exclude=!**/package.json --exclude=!yarn.lock --exclude=!.yarnrc.yml . .
RUN --mount=type=cache,target=/root/.yarn/berry/cache yarn install --immutable

# Build the project
COPY . .
RUN yarn build

FROM gcr.io/distroless/cc-debian13:nonroot@sha256:6ecf048c4622b32291b92266c6618c9ca34989bbfa8ae6dcb82216dce082aabe
WORKDIR /app

EXPOSE 3000
ENV ORIGIN="http://localhost:3000"

# Distroless `:nonroot` uses uid/gid 65532.
COPY --from=build --chown=65532:65532 /workdir/build/node .
ENTRYPOINT ["./node"]
