"use strict";

const rp = require("request-promise");
const activities = require("./activities.json");

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

  if (!text) {
    console.log("not a text message");
    return { statusCode: 200 };
  }

  if (text.startsWith("/start")) {
    await sendToChat(
      chat.id,
      "Hi, I'm DateGoWhere bot. Send /gowhere to start picking an activity!"
    );
  } else if (text.startsWith("/gowhere")) {
    const randomIdx = Math.floor(Math.random() * Math.floor(activities.length));
    const activity = activities[randomIdx];
    await sendToChat(chat.id, activity.name);
  } else {
    await sendToChat(chat.id, "Message not processed: " + text);
  }

  return { statusCode: 200 };
};
