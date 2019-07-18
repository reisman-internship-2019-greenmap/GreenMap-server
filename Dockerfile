FROM node:10.10.0

#RUN mkdir -p /usr/src/app 

#Create app directory
WORKDIR D:/Git_Workspace/GreenMap-server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install 
#-g?
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]

# CMD ["node", "server.js"]

