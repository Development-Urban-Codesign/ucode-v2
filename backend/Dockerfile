FROM python:3.11

WORKDIR /opt/backend

COPY ./requirements.txt /opt/backend/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /opt/backend/requirements.txt

COPY . /opt/backend

ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=3000
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=ligfinder
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
