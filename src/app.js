const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
require('dotenv').config();
const { create } = require("venom-bot");
const axios = require("axios");
app.use(express.json());
const url = process.env.WEBHOOK_URL;
console.log(url);
create(
        "business", // session
        (base64Qr, asciiQR, attempts, urlCode) => {
            console.log('Number of attempts to read the qrcode: ', attempts);
            console.log('Terminal qrcode: ', asciiQR);
            // console.log('base64 image string qrcode: ', base64Qr);
            // console.log('urlCode (data-ref): ', urlCode);
            // console.log(asciiQR); // Optional to log the QR in the terminal
        },
        undefined, // statusFind
        {
            headless: true,
            browserArgs: ["--user-agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36'"], // Original parameters  ---Parameters to be added into the chrome browser instance
            multidevice: true,
            useChrome: false,
            chromiumVersion: '818858',
        }, // options
        undefined, // BrowserSessionToken
        undefined
    ).then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    })

function start(client) {
    client.onMessage(async (message) => {
        let axiosData = {
            "from": message.from,
            "message": message.body
        }
        console.log(axiosData);

        axios({
            url: url,
            method: "post",
            data: axiosData
        }).then(async (res) => {
            console.log(res.data);
            let {from} = axiosData;
            await client
                .sendText(from, res.data)
        })
        .catch(err => console.log(err))
    });

    app.post("/venom", async (req, res) => {
        let {from, message} = req.body;
        await client
            .sendText(from, message)
    })
}
app.get("/", function (req, res) {
    res.redirect("https://onionlite.com");
})
app.listen(4000, () => {
    console.log("server running on port: 3000");
})
