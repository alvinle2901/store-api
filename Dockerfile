FROM node:latest
WORKDIR /app
COPY package*.json ./
COPY ./prisma prisma
RUN npm install
COPY . .
EXPOSE $PORT
CMD ["npm", "run", "devStart"]