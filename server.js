const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const { getRandomQuote } = require('./quotes');

const botToken = '6559713383:AAEJNzOBp_mQ7adffvM_mPHji3W_bhiZoCg';
const bot = new TelegramBot(botToken);

const app = express();
app.use(bodyParser.json());
app.get('/',(req,res)=>{
    res.json({
        confirm:'Congratulations'
    })
})
const subscribers = new Set();

const webhookURL = 'https://37fe-196-191-60-108.ngrok.io'; // Replace with your actual HTTPS webhook URL

// Setting up the webhook
bot.setWebHook(`${webhookURL}/webhook`).then(() => {
  console.log('Webhook set up successfully!');
}).catch((error) => {
  console.error('Error setting up webhook:', error.message);
});


const sendQuoteOfTheDay = () => {
  const quote = getRandomQuote();
  subscribers.forEach((subscriber) => {
    bot.sendMessage(subscriber, quote);
  });
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  subscribers.add(chatId);
  bot.sendMessage(chatId, 'Welcome to the Quote of the Day bot! You are now subscribed.\n\nAvailable commands:\n/quote - Get a random quote\n/unsubscribe - Unsubscribe from the Quote of the Day bot');
});

bot.onText(/\/unsubscribe/, (msg) => {
  const chatId = msg.chat.id;
  subscribers.delete(chatId);
  bot.sendMessage(chatId, 'You have unsubscribed from the Quote of the Day bot.');
});

bot.onText(/\/quote/, (msg) => {
  const chatId = msg.chat.id;
  if (subscribers.has(chatId)) {
    const quote = getRandomQuote();
    bot.sendMessage(chatId, quote);
  } else {
    bot.sendMessage(chatId, 'You need to subscribe to the Quote of the Day bot first. Use /start to subscribe.');
  }
});

// Webhook route to receive updates from Telegram
app.post('/webhook', (req, res) => {
    console.log(req.body);
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const port = 3000; // Replace with the desired port number for your webhook server
app.listen(port, () => {
  console.log(`Webhook server is listening on port ${port}`);
});

const sendQuoteOfTheDayDaily = () => {
  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setHours(9, 0, 0, 0);

  let timeUntilTarget = targetTime - now;
  if (timeUntilTarget <= 0) {
    targetTime.setDate(targetTime.getDate() + 1);
    timeUntilTarget = targetTime - now;
  }

  setTimeout(() => {
    sendQuoteOfTheDay();
    sendQuoteOfTheDayDaily();
  }, timeUntilTarget);
};

sendQuoteOfTheDayDaily();