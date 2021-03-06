"use strict";

const rp = require("request-promise");
const activities = require("./activities.json");

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

async function sendToChat(chat_id, text, params = {}) {
  const options = {
    method: "POST",
    uri: `${BASE_URL}/sendMessage`,
    qs: {
      chat_id,
      text,
      ...params,
    },
  };

  return rp(options);
}

async function answerCallbackQuery(callback_query_id) {
  const options = {
    method: "POST",
    uri: `${BASE_URL}/answerCallbackQuery`,
    qs: { callback_query_id },
  };

  return rp(options);
}

async function editMessageReplyMarkup(chat_id, message_id, reply_markup) {
  const options = {
    method: "POST",
    uri: `${BASE_URL}/editMessageReplyMarkup`,
    qs: { chat_id, message_id, reply_markup },
  };

  return rp(options);
}

function getActivity(location, duration) {
  const activitiesFiltered = activities.filter(
    (a) => a.location == location && a.duration == duration
  );
  const randomIdx = Math.floor(
    Math.random() * Math.floor(activitiesFiltered.length)
  );
  const activity = activitiesFiltered[randomIdx];
  return activity;
}

module.exports.webhook = async (event) => {
  try {
    const body = JSON.parse(event.body);
    console.log("body >>", body);

    if (body.message) {
      const { chat, text } = body.message;

      if (!text) {
        console.log("not a text message");
        return { statusCode: 200 };
      }

      if (text.startsWith("/start")) {
        await sendToChat(
          chat.id,
          "Hi, I'm DateGoWhere bot. Send /gowhere to start picking an activity!",
          {
            reply_markup: JSON.stringify({
              keyboard: [[{ text: "/gowhere" }]],
            }),
          }
        );
      } else if (text.startsWith("/gowhere")) {
        await sendToChat(chat.id, "Do you want something indoor or outdoor?", {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "Indoor 🏠",
                  callback_data: ["LOC", "INDOOR"].join(","),
                },
                {
                  text: "Outdoor 🏖",
                  callback_data: ["LOC", "OUTDOOR"].join(","),
                },
              ],
            ],
          }),
        });
      } else {
        await sendToChat(chat.id, "Message not processed: " + text);
      }
    } else if (body.callback_query) {
      const { id, message, data } = body.callback_query;
      const { chat } = message;
      const cbData = data.split(",");

      await answerCallbackQuery(id);
      await editMessageReplyMarkup(chat.id, message.message_id, null);

      if (cbData[0] == "LOC") {
        await sendToChat(
          chat.id,
          `Ok, ${cbData[1]} it is.\nDo you want something short (half day or less) or full day?`,
          {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "Short",
                    callback_data: ["DUR", cbData[1], "SHORT"].join(","),
                  },
                  {
                    text: "Full day",
                    callback_data: ["DUR", cbData[1], "FULL"].join(","),
                  },
                ],
              ],
            }),
          }
        );
      } else if (cbData[0] == "DUR" || cbData[0] == "ACT") {
        const activity = getActivity(cbData[1], cbData[2]);
        if (!activity)
          await sendToChat(
            chat.id,
            `Oops, we don't have any ${cbData[1]} and ${cbData[2]} activities 😖 Can try something else?`
          );
        let text =
          cbData[0] == "DUR"
            ? `Got it, ${cbData[1]} and ${cbData[2]}.\n\n`
            : "";
        text += `How about: ${activity.name}`;
        await sendToChat(chat.id, text, {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "Ok!",
                  callback_data: "DONE",
                },
                {
                  text: "Nah, another one pls",
                  callback_data: ["ACT", cbData[1], cbData[2]].join(","),
                },
              ],
            ],
          }),
        });
      } else if (cbData[0] == "DONE") {
        await sendToChat(chat.id, "Awesome, have fun! 😄");
      }
    }
  } catch (err) {
    console.error("\n\n\nCaught error:\n", err, "\n\n\n");
  } finally {
    return { statusCode: 200 };
  }
};
