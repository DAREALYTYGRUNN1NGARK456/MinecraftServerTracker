const util = require('minecraft-server-util');
const fs = require('fs');
const moment = require('moment');
require('moment-duration-format');

const config = require('./config.json');

/**
 * Logs message in console and optionaly a file
 *
 * @param {string} message The message to log
 * @param {boolean} file If it's logged to file
 * @return {boolean} If it was logged successfuly
 */
function log(message, fileName) {

    if (!message) throw new Error("Missing \"message\"");
    if (!fileName) throw new Error("Missing \"fileName\"");

    let time = moment().format("HH:mm:ss");
    let format = `[${time}] ${message}`;

    // Log to console
    console.log(format);

    // Log to file
    let date = new Date();
    let dir = "./logs/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    dir = dir + `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.appendFile(`${dir}/${fileName}.txt`, `${format}\n`, (err) => {
        if (err) console.error(err);
    });
}

/**
 * Checks a minecraft server's status
 *
 * @param {string} host The hostname to ping
 * @param {number} timeout The timeout until it is pinged
 * @return {null}
 */
function track(host, timeout) {
    setInterval(function() {
        util.status(host)
            .then((response) => {
                log(`[${response.host}:${response.port}] Players: ${response.onlinePlayers}/${response.maxPlayers}`, host.toLowerCase());
            })
            .catch(() => {
                log(`[${host}] An error has occured when trying to fetch server status`, host.toLowerCase());
            });
    }, timeout)
}

let hosts = config.hosts;
if (!hosts) {
    console.error("\"hosts\" is missing in \"config.json\"");
    process.exit(1);
}

hosts.forEach(s => track(s, config.interval));
