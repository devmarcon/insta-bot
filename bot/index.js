class InstagramBot {
  constructor() {
    this.config = require("../config/puppeter.json");
  }

  async initPuppeter() {
    const puppeteer = require("puppeteer");
    this.browser = await puppeteer.launch({
      headless: this.config.settings.headless,
      args: ["--no-sandbox"],
    });
    this.page = await this.browser.newPage();
    this.page.setViewport({ width: 1500, height: 764 });
  }

  async visitInstagram() {
    await this.page.goto(this.config.base_url, { timeout: 60000 });
    await this.page.waitFor(2500);

    await this.page.click(this.config.selectors.username_field);
    await this.page.keyboard.type(this.config.username);
    await this.page.click(this.config.selectors.password_field);
    await this.page.keyboard.type(this.config.password);
    await this.page.click(this.config.selectors.login_button);
    await this.page.waitFor(5000);

    await this.page.click(this.config.selectors.save_info_button);
    await this.page.waitFor(2500);

    await this.page.click(this.config.selectors.not_now_button);
  }

  async visitUrlAndComment() {
    //go to post url
    await this.page.goto(`${this.config.post_url}`);
    // Navigate to post and submitting the comment
    await this.page.waitForSelector("textarea");

    const followers = require("../followers/followers.json");
    let numberOfComments = 5,
      tagByComment = 2,
      aux = 0;

    for (let i = 0; i < numberOfComments; i++) {
      await this.page.type("textarea", `@${followers[i]} @${followers[i + 1]}`);
      aux += tagByComment;
      await this.page.waitFor(120000);
      await this.page.click('button[type="submit"]');
    }
  }

  async closeBrowser() {
    await this.browser.close();
  }
}

module.exports = InstagramBot;
