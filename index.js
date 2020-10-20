const Bot = require("./bot"); // this directly imports the Bot/index.js file
const config = require("./config/puppeter.json");

const run = async () => {
  const bot = new Bot();

  const startTime = Date();

  await bot.initPuppeter().then(() => console.log("PUPPETEER INITIALIZED"));

  await bot.visitInstagram().then(() => console.log("BROWSING INSTAGRAM"));

  await bot.visitUrlAndComment().then(() => console.log("VISITED URL"));

  await bot.closeBrowser().then(() => console.log("BROWSER CLOSED"));

  const endTime = Date();

  console.log(`START TIME - ${startTime} / END TIME - ${endTime}`);
};

run().catch((e) => console.log(e.message));
