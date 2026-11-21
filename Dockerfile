# Install packages and build the project
FROM node:26-trixie-slim AS build

# Configure the pnpm store
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /work

# Install packages
COPY package.json pnpm-lock.yaml ./
RUN npm install --global "$(node -p 'require("./package.json").packageManager')"
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the project
COPY . .
RUN pnpm run build


# Create runner image
FROM gcr.io/distroless/nodejs26-debian13:nonroot AS runner

WORKDIR /app

COPY --from=build --chown=65532:65532 /work/dist ./dist
COPY --from=build --chown=65532:65532 /work/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /work/package.json ./

ENV NODE_ENV production

# Run the Node.js binary installed from the lockfile.
ENTRYPOINT [ "/app/node_modules/.bin/node", "/app/dist/index.js" ]
