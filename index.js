const axios = require('axios');
const { file } = require('jszip');
const env = require('dotenv').config();
const fs = require('fs');
const { Telegraf } = require('telegraf');

async function geocoding(cityname, zoom = 8) {
  return new Promise(async(resolve, reject) => {
      try {
        let cityInfo = {}
        const response = await axios.get(`https://jz-software.herokuapp.com/api/application/weather?location=${cityname}`);
        const coordinates = response.data[0].coordinates
        console.log(coordinates)
        const fileStream= await axios({ method: 'get', url: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${coordinates[1]},${coordinates[0]},${zoom},0.00,0.00/1280x720@2x?access_token=${process.env.TOKENMAP}`, responseType: 'stream', })
        resolve(fileStream.data);
      } catch (error) {
        console.error(error);
      }
  })
}

const bot = new Telegraf(process.env.TOKEN)

bot.command('map', async (ctx) => {
  const query = ctx.message.text.split(' ').slice(1) 
  const zoom = parseInt(query.pop())
  if(isNaN(zoom)){
    ctx.reply('Invalid zoom value');
    return;
  }
  const stream = await geocoding(query, zoom)
  console.log(query, zoom)
  ctx.replyWithPhoto({ source: stream });
  
})



bot.launch()