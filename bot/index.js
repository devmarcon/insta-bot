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
    // await this.page.click(this.config.selectors.home_to_login_button);
    // await this.page.waitFor(2500);
    /* Click on the username field using the field selector*/
    await this.page.click(this.config.selectors.username_field);
    await this.page.keyboard.type(this.config.username);
    await this.page.click(this.config.selectors.password_field);
    await this.page.keyboard.type(this.config.password);
    await this.page.click(this.config.selectors.login_button);
    await this.page.waitFor(5000);
    //Close save login info modal after login
    await this.page.click(this.config.selectors.save_info_button);
    await this.page.waitFor(2500);
    //Close Turn On Notification modal after login
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

  async _doPostLikeAndFollow(parentClass, page) {
    for (let r = 1; r < 4; r++) {
      //loops through each row
      for (let c = 1; c < 4; c++) {
        //loops through each item in the row

        let br = false;
        //Try to select post
        await page
          .click(
            `${parentClass} > div > div > .Nnq7C:nth-child(${r}) > .v1Nh3:nth-child(${c}) > a`
          )
          .catch((e) => {
            console.log(e.message);
            br = true;
          });
        await page.waitFor(2250 + Math.floor(Math.random() * 250)); //wait for random amount of time
        if (br) continue; //if successfully selecting post continue

        //get the current post like status by checking if the selector exist
        let hasEmptyHeart = await page.$(this.config.selectors.post_heart_grey);

        //get the username of the current post
        let username = await page.evaluate((x) => {
          let element = document.querySelector(x);
          return Promise.resolve(element ? element.innerHTML : "");
        }, this.config.selectors.post_username);
        console.log(`INTERACTING WITH ${username}'s POST`);

        //like the post if not already liked. Check against our like ratio so we don't just like all post
        if (
          hasEmptyHeart !== null &&
          Math.random() < this.config.settings.like_ratio
        ) {
          await page.click(this.config.selectors.post_like_button); //click the like button
          await page.waitFor(10000 + Math.floor(Math.random() * 5000)); // wait for random amount of time.
        }

        //let's check from our archive if we've follow this user before
        let isArchivedUser = null;
        await this.firebase_db
          .inHistory(username)
          .then((data) => (isArchivedUser = data))
          .catch(() => (isArchivedUser = false));

        //get the current status of the current user using the text content of the follow button selector
        let followStatus = await page.evaluate((x) => {
          let element = document.querySelector(x);
          return Promise.resolve(element ? element.innerHTML : "");
        }, this.config.selectors.post_follow_link);

        console.log("followStatus", followStatus);
        //If the text content of followStatus selector is Follow and we have not follow this user before
        // Save his name in the list of user we now follow and follow him, else log that we already follow him
        // or show any possible error
        if (followStatus === "Follow" && !isArchivedUser) {
          await this.firebase_db
            .addFollowing(username)
            .then(() => {
              return page.click(this.config.selectors.post_follow_link);
            })
            .then(() => {
              console.log("<<< STARTED FOLLOWING >>> " + username);
              return page.waitFor(10000 + Math.floor(Math.random() * 5000));
            })
            .catch((e) => {
              console.log("<<< ALREADY FOLLOWING >>> " + username);
              console.log(
                "<<< POSSIBLE ERROR >>>" + username + ":" + e.message
              );
            });
        }

        //Closing the current post modal
        await page
          .click(this.config.selectors.post_close_button)
          .catch((e) => console.log("<<< ERROR CLOSING POST >>> " + e.message));
        //Wait for random amount of time
        await page.waitFor(2250 + Math.floor(Math.random() * 250));
      }
    }
  }

  async closeBrowser() {
    await this.browser.close();
  }
}

module.exports = InstagramBot;
