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

bot.action('report', (ctx) => {
  ctx.editMessageText(`Format report manual:\n/report [nama barang]<spasi>[quantity]<koma>[nama barang]<spasi>[quantity]\ncontoh:\n/report dada 2, sayap 2`);
});

bot.action('harga', async (ctx) => {
  try {
    const { data: { result: items } } = await axios.get(`${server}/items`);

    items.forEach((menu, index) => {
      if (index === items.length - 1) {
        ctx.reply(`${menu.itemName} Rp. ${menu.price.toLocaleString()}`);
        ctx.editMessageText('Daftar Harga:');
      } else {
        ctx.reply(`${menu.itemName} Rp. ${menu.price.toLocaleString()}`);
      }
    });
  } catch (err) {
    console.log('Error get items', err);
  }
});

bot.hears(/report (.+)/, async (ctx) => {
  userId = ctx.from.id;
  const rawMessage = ctx.match[1].split(', ');
  ctx.reply(`🚘 Sedang menyimpan report.......`);

  try {
    const checkUser = await helper.checkUser(`${server}/users/one/${userId}`);

    if (checkUser == true) {
      const mappingReport = await helper.mappingReport(rawMessage);

      if (mappingReport.length === 0) {
        ctx.reply('Please make sure your report again!');
      } else {
        let barang = '';

        mappingReport.forEach((datum, index) => {
          if (index === mappingReport.length - 1) {
            barang += datum.itemName + ' ' + datum.quantity;
          } else {
            barang += datum.itemName + ' ' + datum.quantity + ',\n';
          }
        });

        ctx.reply(`Apakah benar ini report anda?${'\n'}${barang}`,
          Markup.inlineKeyboard([
            [
              Markup.callbackButton("Yes", 'yas'),
              Markup.callbackButton("No", 'nei')
            ]
          ]).extra()
        );

        bot.action('yas', (ctx) => {
          axios.post(`${server}/selling`, { idTelegram: userId, item: mappingReport })
            .then(() => {
              ctx.editMessageText(`Report tersimpan! Terima kasih telah mengirimkan report hari ini 👍`);

              let product = `Saved report today : `;
              mappingReport.forEach(element => {
                product += `\n${element.itemName} = ${element.quantity} pcs`;
              });

              ctx.reply(`${product}`);
            })
            .catch(err => {
              console.log('Error send report', err);
              ctx.editMessageText('Report not saved! Please try again later 😥');
            });
        });

        bot.action('nei', (ctx) => {
          ctx.editMessageText('Report not saved!');
        });
      }
    } else {
      ctx.reply('😢 You are not registered! Please contact admin!');
    }
  } catch (error) {
    console.log(error);
  }
});

bot.launch();
