FROM node:22-bookworm-slim

ARG UID=1000
ARG GID=1000

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN if [ "$GID" != "1000" ]; then groupmod -g "$GID" node; fi && \
    if [ "$UID" != "1000" ]; then usermod -u "$UID" -g "$GID" node; fi

WORKDIR /app
RUN chown -R node:node /app

USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .
RUN mkdir -p /app/.next

EXPOSE 3000
CMD ["npm", "run", "dev"]
