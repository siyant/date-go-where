# date-go-where

A telegram bot that helps you pick a date activity!

Written in NodeJS and deployed on AWS lambda using [Serverless](https://www.serverless.com/) framework.

## Setup

1. Install Serverless: `npm install -g serverless`
2. Install packages: `yarn`

## Running locally

1. Set `TELEGRAM_TOKEN` env var
2. Run `serverless offline`

## Deploying to AWS

1. Set the following env vars:

- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` - from AWS programmatic user
- `TELEGRAM_TOKEN` - obtained from registering a bot with [BotFather](https://core.telegram.org/bots#6-botfather)

2. Run `serverless deploy`

3. To view lambda function logs: `serverless logs -f webhook -t`
