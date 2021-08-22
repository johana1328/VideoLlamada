FROM node:12.22-alpine3.14

##Variables##
RUN mkdir -p /app

ADD VideoEntrevista /app

WORKDIR /app

RUN npm install --quiet

ENTRYPOINT ["node","server.js"]

