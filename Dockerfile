FROM node:26-trixie-slim AS base

ENV PNPM_HOME="/pnpm"
WORKDIR /work

COPY package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --global "$(node -p 'require("./package.json").packageManager')"
COPY pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
    pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile

# Stage the lockfile's Node.js binary and its libatomic dependency.
RUN install -D "$(pnpm exec node -p 'process.execPath')" /runtime/node \
    && install -Dm644 "$(dpkg-query -L libatomic1 | awk '/\/libatomic\.so\.1$/')" /runtime/libatomic.so.1

COPY tsconfig.json ./
COPY src/ ./src/
RUN pnpm run build

FROM gcr.io/distroless/cc-debian13:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /runtime/node /usr/local/bin/node
COPY --from=build /runtime/libatomic.so.1 /usr/lib/libatomic.so.1
RUN ["/usr/local/bin/node", "--version"]

COPY --from=build --chown=65532:65532 /work/dist ./dist
COPY --from=prod-deps --chown=65532:65532 /work/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /work/package.json ./

ENTRYPOINT ["/usr/local/bin/node", "/app/dist/index.js"]
