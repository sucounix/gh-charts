const puppeteer = require("puppeteer");

class PuppeteerBrowser {
  constructor() {
    this.browser = null;
  }

  async open() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: ["--disable-gpu", "--no-sandbox"],
      });
    }

    return this.browser;
  }

  async close() {
    if (this.browser) {
      const pages = await this.browser.pages();

      await Promise.all(pages.map((page) => page.close()));

      await this.browser.close();

      if (this.browser && this.browser.process() != null) {
        this.browser.process().kill("SIGINT");
      }
    }
    this.browser = null;
  }
}

module.exports = new PuppeteerBrowser();
