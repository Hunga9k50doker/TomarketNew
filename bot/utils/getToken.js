const fs = require("fs");
const colors = require("colors");
const { DateTime } = require("luxon");
require("dotenv").config();

function save(id, token) {
  const tokens = JSON.parse(fs.readFileSync("token.json", "utf8"));
  tokens[id] = token;
  fs.writeFileSync("token.json", JSON.stringify(tokens, null, 4));
}

function get(id) {
  const tokens = JSON.parse(fs.readFileSync("token.json", "utf8"));
  return tokens[id] || null;
}

function isExpired(token) {
  const [header, payload, sign] = token.split(".");
  const decodedPayload = Buffer.from(payload, "base64").toString();

  try {
    const parsedPayload = JSON.parse(decodedPayload);
    const now = Math.floor(DateTime.now().toSeconds());

    if (parsedPayload.exp) {
      const expirationDate = DateTime.fromSeconds(parsedPayload.exp).toLocal();
      // this.log(colors.cyan(`Token hết hạn vào: ${expirationDate.toFormat("yyyy-MM-dd HH:mm:ss")}`));

      const isExpired = now > parsedPayload.exp;
      // this.log(colors.cyan(`Token đã hết hạn chưa? ${isExpired ? "Đúng rồi bạn cần thay token" : "Chưa..chạy tẹt ga đi"}`));

      return isExpired;
    } else {
      // this.log(colors.yellow(`Token vĩnh cửu không đọc được thời gian hết hạn`));
      return false;
    }
  } catch (error) {
    console.error(colors.red(`Lỗi rồi: ${error.message}`));
    return true;
  }
}

module.exports = { get, save, isExpired };
