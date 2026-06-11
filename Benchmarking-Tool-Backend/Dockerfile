FROM python:3.13

# Prevent .pyc files and force stdout flushing
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /usr/src/api

# Copy requirement
COPY ./requirements.txt /usr/src/api/requirements.txt

RUN pip install -r requirements.txt

# Copy app code
COPY . /usr/src/api/
