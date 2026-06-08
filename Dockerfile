FROM node:20-alpine

RUN apk add --no-cache bash docker-cli git

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

COPY . .

CMD ["npm", "test"]
