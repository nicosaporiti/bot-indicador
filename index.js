require('dotenv').config();
const { TwitterClient } = require('twitter-api-client');
const axios = require('axios');
const cron = require('node-cron');

const twitterClient = new TwitterClient({
  apiKey: process.env.TWITTER_API_KEY,
  apiSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

cron.schedule(
  "0 4 * * monday-friday",
  () => {
let buda = 'https://www.buda.com/api/v2/markets/btc-usdc/ticker';
let miIndicador = ' https://mindicador.cl/api';

const requestOne = axios.get(buda);
const requestTwo = axios.get(miIndicador);

axios
  .all([requestOne, requestTwo])
  .then(
    axios.spread((requestOne, requestTwo) => {
      const btcPrice = requestOne.data.ticker.last_price[0];
      const { uf, dolar, ipc, libra_cobre, tpm } = requestTwo.data;
      const date = uf.fecha.split(/[-,T]| /);
      const year = date[0];
      const monthD = date[1];
      const day = date[2];
      const ipcMonth = ipc.fecha.split('-')[1];
      const ipcYear = ipc.fecha.split('-')[0];

      const formatNumber = (n) => {
        return n.toLocaleString('es-CL');
      };

      let tweet = `
      Indicadores por 🤖 para 🇨🇱
      
      Valores al ${day}/${monthD}/${year}
  
      UF = ${formatNumber(uf.valor)}
      Dólar = ${formatNumber(dolar.valor)}
      Cobre = ${formatNumber(libra_cobre.valor)}
      #Bitcoin = USDC ${formatNumber(parseFloat(btcPrice))} (Buda.com)
  
      IPC (${ipcMonth}/${ipcYear}) = ${formatNumber(ipc.valor)} %
      TPM = ${formatNumber(tpm.valor)} %
  
      `;

      // use/access the results
      twitterClient.tweets
        .statusesUpdate({
          status: tweet,
        })
        .then((response) => {
          console.log("Tweeted!", response);
        })
        .catch((err) => {
          console.log(err);
        });
    })
  )
  .catch((errors) => {
    // react on errors.
    console.error(errors);
  });
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);
