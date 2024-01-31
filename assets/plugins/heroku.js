const got = require("got");
const Heroku = require("heroku-client");
const { version } = require("../../package.json");
const { command, isPrivate, updateBot } = require("../../lib/");
const Config = require("../../config");
const { SUDO } = require("../../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const simpleGit = require("simple-git");
const git = simpleGit();
const exec = require("child_process").exec;

command(
    {
        pattern: "update",
        fromMe: true,
        desc: "Checks for update.",
    },
    async (message, match) => {
        await git.fetch();
        var commits = await git.log([
            Config.BRANCH + "..origin/" + Config.BRANCH,
        ]);

        async function updateHeroku() {
            await updateBot(message);
        }

        if (match == "now") {
            if (commits.total === 0) {
                return await message.send(`_SelfoBotz is on the latest version: v${version}_`);
            } else {
                await updateHeroku();
            }
        } else if (commits.total === 0) {
            return await message.send(`_SelfoBotz is on the latest version: v${version}_`);
        } else {
            var availupdate = "*Updates available for SelfoBotz* \n\n";
            commits["all"].map((commit, num) => {
                availupdate += num + 1 + " ●  " + tiny(commit.message) + "\n";
            });

            return await message.client.sendMessage(message.jid, {
                text: `${availupdate}\n\n _type *${Config.HANDLERS} update now*_`
            });
        }
    }
);

// Add other command patterns and functions as needed...
