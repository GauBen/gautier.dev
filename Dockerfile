FROM debian:13-slim@sha256:109e2c65005bf160609e4ba6acf7783752f8502ad218e298253428690b9eaa4b AS build
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
WORKDIR /workdir

# Install system dependencies and mise (https://mise.jdx.dev/)
ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/mise/shims:$PATH"
RUN apt-get update && apt-get -y --no-install-recommends install libatomic1 curl ca-certificates gnupg git \
  && rm -rf /var/lib/apt/lists/* \
  && gpg --keyserver hkps://keys.openpgp.org --recv-keys 24853EC9F655CE80B48E6C3A8B81C9D17413A06D \
  && curl https://mise.jdx.dev/install.sh.sig | gpg | sh

# Install dev tools via mise
ENV MISE_ALWAYS_KEEP_DOWNLOAD="true"
ENV MISE_TRUSTED_CONFIG_PATHS="/workdir/mise.toml"
COPY mise.toml .
RUN --mount=type=cache,target=/mise/downloads mise install

# Install js dependencies
COPY --parents **/package.json upm.lock ./
RUN --mount=type=cache,target=/root/.upm upm ci

# Build the project and collect its shared libraries into /rootfs
COPY . .
RUN upm build \
  && mkdir /rootfs \
  && ldd build/node | grep --only-matching --extended-regexp '/\S+' | xargs --verbose -- cp --dereference --parents --target-directory=/rootfs --

FROM scratch
WORKDIR /app

EXPOSE 3000

# Copy all runtime dependencies (resolved by ldd for the target architecture)
COPY --from=build /rootfs/ /

# Use a non-root user to run the application
USER 65532:65532
COPY --from=build --chown=65532:65532 /workdir/build/node .
HEALTHCHECK --start-interval=2s --start-period=2s CMD ["./node", "--healthcheck"]
ENTRYPOINT ["./node"]
