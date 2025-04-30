FROM node:20-alpine
COPY . /app
WORKDIR /app
RUN npm i 

CMD ["npm", "run", "dev"]