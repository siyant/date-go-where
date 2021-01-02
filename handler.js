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
                  text: "Indoor",
                  callback_data: JSON.stringify({
                    step: "LOCATION",
                    choice: "INDOOR",
                  }),
                },
                {
                  text: "Outdoor",
                  callback_data: JSON.stringify({
                    step: "LOCATION",
                    choice: "OUTDOOR",
                  }),
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
      const cbData = JSON.parse(data);

      await answerCallbackQuery(id);

      if (cbData.step == "LOCATION") {
        await sendToChat(
          chat.id,
          "Do you want something short (half day or less) or full day?",
          {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "Short",
                    callback_data: JSON.stringify({
                      step: "DURATION",
                      choice: "SHORT",
                      location: cbData.choice,
                    }),
                  },
                  {
                    text: "Full day",
                    callback_data: JSON.stringify({
                      step: "DURATION",
                      choice: "FULL",
                      location: cbData.choice,
                    }),
                  },
                ],
              ],
            }),
          }
        );
      } else if (cbData.step == "DURATION") {
        const activity = getActivity(cbData.location, cbData.choice);
        await sendToChat(chat.id, `How about: ${activity.name}`);
      }
    }
  } catch (err) {
    console.error("\n\n\nCaught error:\n", err, "\n\n\n");
  } finally {
    return { statusCode: 200 };
  }
};
