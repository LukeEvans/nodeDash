FROM ubuntu:15.10

RUN apt-get update
RUN apt-get install -y git curl npm libpcap-dev curl
#RUN npm install node-dash-button wemo-client
