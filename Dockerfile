# Install packages and build the project
FROM node:22-alpine AS build

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /work

# Install packages
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the project
COPY . .
RUN pnpm run build


# Create runner image
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner

WORKDIR /app

COPY --from=build --chown=65532:65532 /work/dist ./dist
COPY --from=build --chown=65532:65532 /work/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /work/package.json ./

ENV NODE_ENV production

ENTRYPOINT [ "/nodejs/bin/node", "/app/dist/index.js" ]