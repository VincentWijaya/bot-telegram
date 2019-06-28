const Telegraf = require('telegraf');
const { Markup } = require('telegraf');
require('dotenv').config();

const helper = require('./helper');

const bot = new Telegraf(process.env.BOT_TOKEN);
const server = process.env.SERVER;

let userId;

bot.start((ctx) => ctx.reply('Welcome! Type /help to see available commands!'));

bot.help((ctx) => {
  ctx.reply(`List Perintah:`,
    Markup.inlineKeyboard([
      [
        Markup.callbackButton("My ID", 'myId'),
        Markup.callbackButton("My Report", 'myReport')
      ], [
        Markup.callbackButton("Harga", 'harga'),
        Markup.callbackButton("Report", 'report')
      ]
    ]).extra()
  );
});

bot.action('myId', (ctx) => {
  ctx.editMessageText(`🆔: ${ctx.from.id}`);
});

bot.action('myReport', async (ctx) => {
  userId = ctx.from.id;

  try {
    const checkUser = await helper.checkUser(`${server}/users/one/12345}`);
    console.log(checkUser);
  } catch (error) {
    console.log(error);
  }
});

bot.launch();
