FROM node:12
RUN apt-get update && \
    apt-get install -y python vim less make zip
