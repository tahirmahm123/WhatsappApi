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
            console.log('base64 image string qrcode: ', base64Qrimg);
            console.log('urlCode (data-ref): ', urlCode);
            console.log(asciiQR); // Optional to log the QR in the terminal
            const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                response = {};

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }
            response.type = matches[1];
            response.data = new Buffer.from(matches[2], 'base64');

            require('fs').writeFile(
                'out.png',
                response['data'],
                'binary',
                function (err) {
                    if (err != null) {
                        console.log(err);
                    }
                }
            );
        },
        undefined, // statusFind
        {
            folderNameToken: "tokens", // folder name when saving tokens
            mkdirFolderToken: "", // folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
            headless: true, // Headless chrome
            devtools: false, // Open devtools by default
            useChrome: true, // If false will use Chromium instance
            debug: false, // Opens a debug session
            logQR: true, // Logs QR automatically in terminal
            browserWS: "", // If u want to use browserWSEndpoint
            browserArgs: ["--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36"], // Original parameters  ---Parameters to be added into the chrome browser instance
            puppeteerOptions: {}, // Will be passed to puppeteer.launch
            disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
            disableWelcome: true, // Will disable the welcoming message which appears in the beginning
            updatesLog: true, // Logs info updates automatically in terminal
            autoClose: false, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
            createPathFileToken: false, // creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
            addProxy: [""], // Add proxy server exemple : [e1.p.webshare.io:01, e1.p.webshare.io:01]
            userProxy: "", // Proxy login username
            userPass: "", // Proxy password,
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
