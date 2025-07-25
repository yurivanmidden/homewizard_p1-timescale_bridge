FROM node:20-alpine
WORKDIR /app
RUN npm install node-fetch pg
COPY . .
CMD ["node", "index.js"]