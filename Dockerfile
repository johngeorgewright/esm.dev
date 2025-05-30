FROM node:lts-alpine AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json package-lock.json /temp/prod/
RUN cd /temp/prod && npm ci --omit=dev --ignore-scripts

# copy production dependencies and source code into final image
FROM base AS release

RUN apk update && apk add bash
COPY --from=install /temp/prod/node_modules node_modules
COPY src src
COPY entrypoint .

ENTRYPOINT [ "./entrypoint" ]
