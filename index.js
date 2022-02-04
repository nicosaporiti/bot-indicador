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

const initValue = {
  initUf: 30991.74,
  initDolar: 850.25,
  initCobre: 4.35,
  initBtc: 47209,
  initIpc: 0.5,
  initTpm: 4
}

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

      const yearToDate = (i, l) => {
        const ytd = ((l, i) -1) * 100;
        let arrow;

        if(ytd > 0) {
          arrow = '⬆️ '
        } else {
          arrow = '🔻 '
        }


        return  (arrow + ytd.toLocaleString('es-CL', {maximumFractionDigits: 2}));
      }

      let tweet = `
      Indicadores 🇨🇱
      
      Valores al ${day}/${monthD}/${year} (YTD)
  
      UF = ${formatNumber(uf.valor)} (${yearToDate(uf.valor / initValue.initUf)} %)
      Dólar = ${formatNumber(dolar.valor)} (${yearToDate(dolar.valor / initValue.initDolar)} %)
      Cobre = ${formatNumber(libra_cobre.valor)} (${yearToDate(libra_cobre.valor / initValue.initCobre)} %)
      #Bitcoin = USDC ${formatNumber(parseFloat(btcPrice))} (${yearToDate(btcPrice / initValue.initBtc)} %)
  
      IPC (${ipcMonth}/${ipcYear}) = ${formatNumber(ipc.valor)} % 
      TPM = ${formatNumber(tpm.valor)} % 
  
      `;

      console.log(tweet)

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
