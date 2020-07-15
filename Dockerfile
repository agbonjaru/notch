FROM node:alpine

#RUN mkdir -p /src/

WORKDIR /src/notch-angular

#RUN apk add --update gcc

#RUN apt-get -yq update && apt-get -yq install git bzip2 automake build-essential


COPY . /src/notch-angular/

#or use ADD . /src/notch-angular


# If you are building your code for production
# RUN npm ci --only=production

#RUN npm install -g @angular/cli@7 

RUN npm install

#RUN ng build 
# Bundle app source
#COPY . /src/app/


EXPOSE 8081:8081


#RUN node server.js

#CMD [ "node", "server.js" ]
CMD [ "npm", "start" ]
CMD [ "node", "server.js" ]