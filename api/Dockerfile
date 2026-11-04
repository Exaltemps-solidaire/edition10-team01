# Service api du gabarit : Node exécute le TypeScript directement, sans dépendance ni compilation.
FROM docker.io/library/node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY src ./src
COPY data ./data
RUN chmod -R a+rX ./data
ENV NODE_ENV=production PORT=8081
EXPOSE 8081
USER node
CMD ["node", "src/server.ts"]
