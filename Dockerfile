FROM node:18-alpine as dev
WORKDIR /opt/app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:18-alpine as prod
WORKDIR /opt/app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --prod
COPY . .
COPY --from=dev /opt/app/dist ./dist

EXPOSE 4000
CMD ["pnpm", "start:build"]