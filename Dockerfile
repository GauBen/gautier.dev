FROM debian:13-slim@sha256:77ba0164de17b88dd0bf6cdc8f65569e6e5fa6cd256562998b62553134a00ef0 AS build
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
WORKDIR /workdir

# Install system dependencies and mise (https://mise.jdx.dev/)
ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/mise/shims:$PATH"
RUN apt-get update && apt-get -y --no-install-recommends install libatomic1 curl ca-certificates gnupg \
  && rm -rf /var/lib/apt/lists/* \
  && gpg --keyserver hkps://keys.openpgp.org --recv-keys 24853EC9F655CE80B48E6C3A8B81C9D17413A06D \
  && curl https://mise.jdx.dev/install.sh.sig | gpg | sh

# Install dev tools via mise
ENV MISE_ALWAYS_KEEP_DOWNLOAD="true"
ENV MISE_TRUSTED_CONFIG_PATHS="/workdir/mise.toml"
COPY mise.toml .
RUN --mount=type=cache,target=/mise/downloads mise install

# Install js dependencies
COPY --exclude=* --exclude=!**/package.json --exclude=!yarn.lock --exclude=!.yarnrc.yml --exclude=!*.tgz . .
RUN --mount=type=cache,target=/root/.yarn/berry/cache yarn install --immutable

# Build the project
COPY . .
RUN yarn build

FROM scratch
WORKDIR /app

EXPOSE 3000
ENV ORIGIN="http://localhost:3000"

# Copy all runtime dependencies (ldd build/node)
COPY --from=build /lib64/ld-linux-x86-64.so.2 /lib64/ld-linux-x86-64.so.2
COPY --from=build \
  /lib/x86_64-linux-gnu/libatomic.so.1 /lib/x86_64-linux-gnu/libdl.so.2 \
  /lib/x86_64-linux-gnu/libm.so.6      /lib/x86_64-linux-gnu/libstdc++.so.6 \
  /lib/x86_64-linux-gnu/libgcc_s.so.1  /lib/x86_64-linux-gnu/libpthread.so.0 \
  /lib/x86_64-linux-gnu/libc.so.6      /lib/x86_64-linux-gnu/

# Use a non-root user to run the application
USER 65532:65532
COPY --from=build --chown=65532:65532 /workdir/build/node .
HEALTHCHECK --start-interval=2s CMD [ "./node", "--healthcheck", "http://localhost:3000"]
ENTRYPOINT ["./node"]
