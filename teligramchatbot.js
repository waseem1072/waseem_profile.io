const TelegramBot = require("node-telegram-bot-api");

// Replace with your bot token
const token = "Y7372904576:AAEKLW59mWGMRkF-pDo9ETsx0fznlR8RKqo";

// Create bot with polling
const bot = new TelegramBot(token, { polling: true });

// Handle messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  console.log("User said:", msg.text);

  // Reply back
  bot.sendMessage(chatId, `You said: ${msg.text}`);
});

// Optional: expose endpoint for frontend
const express = require("express");
const app = express();
app.use(express.json());

app.post("/sendMessage", (req, res) => {
  const { chatId, text } = req.body;
  bot.sendMessage(chatId, text);
  res.send({ status: "ok" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
