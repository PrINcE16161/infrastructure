FROM node:24

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]