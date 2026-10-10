FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json server.js business.js ./
COPY --chown=node:node public ./public
RUN mkdir /data && chown node:node /data
USER node
ENV HOST=0.0.0.0 PORT=8769 DATA_DIR=/data
EXPOSE 8769
CMD ["node", "server.js"]
