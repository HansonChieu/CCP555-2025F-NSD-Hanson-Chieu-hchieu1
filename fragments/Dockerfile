#Dockerfile 

#Specifies the parent or base image to use as  a starting point for building a new Docker image.
FROM node

#Use node version 22.19.0
FROM node:22.19.0

#Key=value pairs with aribitrary metadaata about the image
LABEL maintainer="Hanson Chieu <hansonchieu@hotmail.com>"
LABEL description="Fragments node.js microservice"

#Defines evnironment variables that can be used during the build process and at runtime.
# We default to use port 8080 in our service
ENV PORT=8080
 
# Reduce npm spam when installing within Docker
# [URL documentation]
ENV NPM_CONFIG_LOGLEVEL=warn
 
# Disable colour when run inside Docker
# [URL documentation]
ENV NPM_CONFIG_COLOR=false

#Define the app's working directory
WORKDIR /app

#Copy package.json and package-lock.json to the working directory
COPY package*.json ./

#Install node dependencies
RUN npm install

#Copy src to /app/src
COPY ./src ./src

#Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

#Star the container by running our server
CMD ["npm", "start"]

#Expose the port that the app runs on
EXPOSE 8080
