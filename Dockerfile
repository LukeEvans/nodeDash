FROM ubuntu:15.10

RUN apt-get update
RUN apt-get install -y git curl npm libpcap-dev curl vim
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
RUN nvm install v5.8.0
#RUN npm install node-dash-button wemo-client
