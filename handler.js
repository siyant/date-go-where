"use strict";

const rp = require("request-promise");

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

async function sendToChat(chat_id, text) {
  const options = {
    method: "POST",
    uri: `${BASE_URL}/sendMessage`,
    qs: {
      chat_id,
      text,
    },
  };

  return rp(options);
}

module.exports.webhook = async (event) => {
  const body = JSON.parse(event.body);
  console.log("body >>", body);

  const { chat, text } = body.message;

  await sendToChat(chat.id, "Received ur message: " + text);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
