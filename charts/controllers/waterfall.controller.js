const { Buffer } = require("buffer");
const Jimp = require("jimp");
const {
  renderWaterfallHTML,
} = require("../views/waterfall-views/waterfall.views");
const puppeteerBrowser = require("../services/puppeteer.service");

const getWaterfall = async (req, res) => {
  const summarySectionHeight = 240;
  const { chartHTML, actualHeight } = renderWaterfallHTML(req.body);

  const html = `
  <html>
    <head>
        <title></title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link
                href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
                rel="stylesheet"
                />
        <style>
        body {
            font-family: "DM Sans", sans-serif;
        }
        hr {
            border: 0.5px solid rgba(0,0,0,0.1);
        }
        </style>
    </head>
    <body>
        ${chartHTML}
    </body>
</html>
    `;

  try {
    const MAX_HEIGHT = 1600;
    const WIDTH = 1200;

    const browser = await puppeteerBrowser.open();

    const page = await browser.newPage();

    page.setViewport({
      width: WIDTH,
      height: actualHeight + summarySectionHeight,
    });

    await page.setContent(html);

    const b64string = await page.screenshot({
      encoding: "base64",
      optimizeForSpeed: true,
    });

    page.close();

    let bufferImage = Buffer.from(b64string, "base64");

    if (actualHeight + summarySectionHeight > MAX_HEIGHT) {
      await Jimp.read(bufferImage).then((image) => {
        image
          .resize(WIDTH, MAX_HEIGHT)
          .quality(100)
          .getBuffer("image/png", (_, buffer) => {
            if (buffer) bufferImage = buffer;
          });
      });
    }

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": bufferImage.length,
    });

    res.end(bufferImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWaterfall,
};
