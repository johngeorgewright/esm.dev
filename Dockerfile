FROM oven/bun:1 AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM base AS release

COPY --from=install /temp/prod/node_modules node_modules
COPY src src
COPY entrypoint .

# run the app
USER bun
ENTRYPOINT [ "./entrypoint" ]
