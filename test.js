const puppeteer = require("puppeteer");



(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1500, height: 968 });

    var word = "word";

    try {
        await page.goto("file:///C:/Users/Administrator/Desktop/we/index.html");
        let w = await page.$eval(".test", input => input.value = "dsacfdsf");
        console.log(w);
    } catch (e) {
        console.log("未找到登录跳转链接，重载页面");
    }
})();