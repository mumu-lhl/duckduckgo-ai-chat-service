FROM denoland/deno:1.45.5

# The port that your application listens to.
EXPOSE 1993

WORKDIR /app

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-env", "--unstable", "main.ts"]
