"use strict";

const assert = require("assert");
const http = require("http");
const { URL } = require("url");

// test: env-cmd -f ../../dev.env node index.js

assert(process.env.CENTRIFUGO_API_URL, "Empty ENV: CENTRIFUGO_API_URL");
assert(process.env.CENTRIFUGO_API_KEY, "Empty ENV: CENTRIFUGO_API_KEY");
assert(process.env.CENTRIFUGO_SECRET, "Empty ENV: CENTRIFUGO_SECRET");

const url = new URL(process.env.CENTRIFUGO_API_URL);

/**
 * Send Data
 * @param {String} channel
 * @param {{}} data
 * @return {Promise<void>}
 */
async function centSend(channel, data = {}) {
  assert(channel, "Empty channel name");
  const payload = JSON.stringify({
    method: "publish",
    params: {
      channel,
      data
    }
  });

  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: "POST",
    headers: {
      Authorization: "apikey " + process.env.CENTRIFUGO_API_KEY,
      "Content-Length": payload.length
    }
  };

  return new Promise((resolve, reject) => {
    let result = "";
    const req = http.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      if (res.statusCode !== 200) {
        reject("Error Code: " + res.statusCode);
      }
      res.on("data", chunk => {
        result += chunk.toString();
      });
      res.on("end", () => {
        resolve();
      });
    });
    req.on("error", e => reject(e));
    req.write(payload);
    req.end();
  });
}

/**
 * Send Data to user
 * @param {number} userId
 * @param {{}} data
 * @return {Promise<void>}
 */
async function centSendUser(userId, data = {}) {
  assert(userId, "Empty userId");
  return centSend("U#" + userId, data);
}

module.exports = {
  centSend,
  centSendUser
};
