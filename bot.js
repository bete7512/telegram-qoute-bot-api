const TelegramBot = require('node-telegram-bot-api');
const { getRandomQuote } = require('./quotes');

const botToken = '6559713383:AAEJNzOBp_mQ7adffvM_mPHji3W_bhiZoCg'; // Replace with your actual Telegram bot token
const bot = new TelegramBot(botToken);

const subscribers = new Set();

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

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  
  switch (messageText) {
    case '/start':
    case '/unsubscribe':
    case '/quote':
      // These commands are already handled by their respective callbacks
      break;
    default:
      bot.sendMessage(chatId, 'Unknown command. Please use one of the available commands:\n/quote - Get a random quote\n/unsubscribe - Unsubscribe from the Quote of the Day bot');
      break;
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

bot.startPolling();
