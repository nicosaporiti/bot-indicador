require("dotenv").config();
const { TwitterClient } = require("twitter-api-client");
const axios = require("axios");
const cron = require("node-cron");

const twitterClient = new TwitterClient({
  apiKey: process.env.TWITTER_API_KEY,
  apiSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

cron.schedule('0 4 * * * ', () => {
  axios.get("https://mindicador.cl/api").then((res) => {
  const { uf, dolar, ipc, tpm, libra_cobre, bitcoin } = res.data;
  const date = uf.fecha.split(/[-,T]| /);
  const year = date[0];
  const monthD = date[1];
  const day = date[2];
  const ipcMonth = ipc.fecha.split("-")[1];
  const ipcYear = ipc.fecha.split("-")[0];
  let tweet = `
    Esto es un 🤖 para 🇨🇱
    
    IPC (${ipcMonth}/${ipcYear}) = ${ipc.valor} %
    
    Valores al ${day}/${monthD}/${year}
    UF = ${uf.valor}
    Dólar = ${dolar.valor}
    TPM = ${tpm.valor}
    Cobre = ${libra_cobre.valor}
    #Bitcoin = ${bitcoin.valor}
    `;

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
    
});;
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});


