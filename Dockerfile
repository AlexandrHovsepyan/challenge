FROM node:alpine
VOLUME ["/home/app"]
EXPOSE 5000
COPY package.json /home/
COPY .env /home/
RUN chmod -R 0644 /home/
WORKDIR /home/
RUN npm cache clean --force
RUN npm install
CMD npm run start-docker