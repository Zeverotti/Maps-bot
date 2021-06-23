const axios = require('axios');
const { file } = require('jszip');
const env = require('dotenv').config();
const fs = require('fs');

const cityname = 'Ottawa'

let cityInfo = {}



async function geocoding() {
    try {
      const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=5&appid=${process.env.TOKENGEO}`);
      cityInfo = response.data[0];
      console.log(cityInfo)
      const fileStream= await axios({ method: 'get', url: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/${cityInfo.lon},${cityInfo.lat},9,0.00,0.00/1280x720@2x?access_token=${process.env.TOKENMAP}`, responseType: 'stream', })
      console.log(fileStream.data)
      const w = fs.createWriteStream(`${cityInfo.name}.png`)
      fileStream.data.pipe(w)
    } catch (error) {
      console.error(error);
    }
  }

 geocoding()

if(process.argv[2] == '-h'){
    console.log('Documentation: \n\nExample: mapic ottawa 9\nStructure: mapic (cityname) (zoom 0 < x > 20) (optional: path)')
}