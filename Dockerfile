FROM denoland/deno:alpine
RUN apk update && apk add bash
WORKDIR /app
COPY deno.json ./
RUN deno install
COPY src src
COPY entrypoint ./
ENTRYPOINT [ "./entrypoint" ]
