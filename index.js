const { Markup } = require('telegraf');
require('dotenv').config();
const axios = require('axios');
const { Telegraf } = require('telegraf');

async function geocoding(coordinates, zoom = 8) {
  return new Promise(async(resolve, reject) => {
      try {
        const fileStream = await axios({ 
          method: 'get', 
          url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${coordinates[1]},${coordinates[0]},${zoom},0.00,0.00/1280x720@2x?access_token=${process.env.TOKENMAP}`, 
          responseType: 'stream',
        });
        resolve(fileStream.data);
      } catch (error) {
        reject(error);
      }
  })
}

async function getCoordinates(cityname) {
  return new Promise(async(resolve, reject) => {
      try {
        const response = await axios.get(`https://jz-software.herokuapp.com/api/application/weather?location=${cityname}`);
        const coordinates = response.data[0].coordinates;
        resolve(coordinates);
      } catch (error) {
        reject(error);
      }
  })
}

const bot = new Telegraf(process.env.TOKEN);

bot.command('map', async (ctx) => {
  const query = ctx.message.text.split(' ').slice(1) 
  const zoom = parseInt(query.pop())
  if(isNaN(zoom)){
    ctx.reply('Invalid zoom value');
    return;
  }
  try {
    let coordinates = await getCoordinates(query);
    const stream = await geocoding(coordinates, zoom);
    coordinates = `${coordinates[0]};${coordinates[1]}`; 
    ctx.replyWithPhoto({ source: stream },{ reply_markup: Markup.inlineKeyboard([
    Markup.callbackButton('zoom +', `zoom-${coordinates}-${zoom}-up`),
    Markup.callbackButton('zoom -', `zoom-${coordinates}-${zoom}-down`), 
]),
});
    console.log(coordinates);
  } catch (error) {
    ctx.reply('An error occurred: '+error.message);
  }
})

bot.action(/^zoom/, async (ctx) => {
  try{
    const args = ctx.match.input.split('-');
    let coordinates = args[1].split(';').map(e => parseFloat(e));
    let zoom = parseInt(args[2]);
    zoom = args[3] === "up" ? zoom + 1 : zoom - 1;
    const stream = await geocoding(coordinates, zoom);
    coordinates = coordinates.join(';');
    await ctx.editMessageMedia({type: 'photo', media:{ source: stream}}, { reply_markup: Markup.inlineKeyboard([
      Markup.callbackButton('zoom +', `zoom-${coordinates}-${zoom}-up`),
      Markup.callbackButton('zoom -', `zoom-${coordinates}-${zoom}-down`), 
    ])
    });
    await ctx.answerCbQuery();
} catch (error) {
  ctx.reply('An error occurred: '+ error.message);
}
    
});


bot.launch()
