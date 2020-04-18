const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");

const autoScroll = (page) => {
    return page.evaluate(() => {
        return new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            // 每200毫秒让页面下滑100像素的距离
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        })
    });
};

const getTime = () => {
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,                 //月份 
            "d+": this.getDate(),                    //日 
            "h+": this.getHours(),                   //小时 
            "m+": this.getMinutes(),                 //分 
            "s+": this.getSeconds(),                 //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds()             //毫秒 
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };
    let time = new Date().format("yyyy-MM-dd hh:mm:ss")
    return time;
};

const emailInform = () => {
    let time = getTime();
    let transporter = nodemailer.createTransport({
        service: "qq",
        port: 465,
        secureConnection: true, // 使用了 SSL
        auth: {
            user: "3287124026@qq.com",
            // 这里密码不是qq密码，是你设置的smtp授权码
            // 获取qq授权码请看:https://jingyan.baidu.com/article/6079ad0eb14aaa28fe86db5a.html
            pass: "enrtqhlhlkpzchhg",
        }
    });

    let mailOpt = {
        from: "3287124026@qq.com",
        to: "antcoder@outlook.com",
        subject: "东南大学全校师生每日健康申报",
        text: `${time} 今日申报成功！`
    };

    transporter.sendMail(mailOpt, (err, info) => {
        if (err) 
            console.log("邮件发送失败。。。");
        else
            console.log(`邮件(id: ${info.messageId}) 发送成功！`);
    });
};

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1500, height: 968 });

    var word = "word";

    while (true) {
        try {
            await page.goto("http://ehall.seu.edu.cn/new/index.html");
            await page.waitFor(3000);
            login = await page.waitForSelector("#ampHasNoLogin");
            await login.click();
            await page.waitForNavigation();
            break;
        } catch (e) {
            console.log("未找到登录跳转链接，重载页面");
        }

    }

    // 登录
    await page.type("#username", "220191746");
    await page.type("#password", "Wsz123456789");
    word = await page.$eval("#xsfw", ele => ele.innerText);
    console.log(word)
    await page.click("#xsfw");

    while (true) {
        try {
            // 进入每日申报页面
            console.log("登录成功，进入申报页面");
            await page.goto("http://ehall.seu.edu.cn/appShow?appId=5821102911870447");
            await page.waitForNavigation();
            url = await page.url();
            console.log("current url: " + url);
            // 进入基本信息填写
            add = await page.waitForSelector("body > main > article > section > div.bh-mb-16 > div.bh-btn.bh-btn-primary");
            await add.click();
            break;
        } catch (e) {
            console.log("超时");
        }
    }

    await page.waitFor(2000)

    try {
        isReported = await page.waitForSelector(".bh-bhdialog-container > div.bh-modal > div.bh-pop.bh-card.bh-card-lv4.bh-dialog-con > div.bh-dialog-center > div.bh-dialog-btnContainerBox > a");
        await isReported.click();    // 今日健康信息已填报
        console.log("今日已填报！");
    } catch (e) {
        // 填报今日信息
        await autoScroll(page);
        await page.waitFor(3000);

        save = await page.waitForSelector("#save");
        console.log("保存按钮已加载");
        await save.click();

        await page.waitFor(2000);

        submit = await page.waitForSelector(".bh-bhdialog-container > div.bh-modal > div.bh-pop.bh-card.bh-card-lv4.bh-dialog-con > div.bh-dialog-center > div.bh-dialog-btnContainerBox > a.bh-dialog-btn.bh-bg-primary.bh-color-primary-5");
        console.log("确定数据并提交吗？");
        await submit.click();
        console.log("今日情况申报完成！");
        await page.waitFor(3000);
    }

    while (true) {
        // 登出
        try {
            await page.goto("http://ehall.seu.edu.cn/new/index.html");
            await page.waitFor(5000);
            avatar = await page.waitForSelector("#ampHeaderToolUserName");
            await avatar.click();
            await page.waitFor(1000);
            await page.click("#ampHeaderUserInfoLogoutBtn");
            console.log("安全退出");
            await page.waitFor(2000);
            await browser.close();
            
            emailInform();
            
            break;
        } catch (e) {
            console.log("未找到退出按钮，重新加载页面");
        }
    }
})();