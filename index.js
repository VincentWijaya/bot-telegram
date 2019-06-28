const Telegraf = require('telegraf');
const { Markup } = require('telegraf');
const axios = require('axios');
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
    const checkUser = await helper.checkUser(`${server}/users/one/${userId}`);

    if (checkUser == true) {
      const { data: sellingData } = await axios.get(`${server}/selling/telegram/${userId}`);

      if (sellingData.length === 0) {
        ctx.editMessageText('You dont have any report!');
      } else {
        sellingData.forEach((item, index) => {
          let total = 0
          let product = `List item sold ${item.createdAt.toString().slice(0, 10)}`
          item.selling.forEach(element => {
            total += Number(element.Total)
            product += `\n${element.itemName} = ${element.quantity} pcs = Rp.${element.Total.toLocaleString()}`
          });

          if (index === sellingData.length - 1) {
            ctx.editMessageText(`${product} \nTotal : Rp.${total.toLocaleString()}`)
          } else {
            ctx.reply(`${product} \nTotal : Rp.${total.toLocaleString()}`)
          }
        });
      }
    } else {
      ctx.editMessageText('😢 You are not registered! Please contact admin!');
    }
  } catch (error) {
    console.log(error);
  }
});

bot.launch();
