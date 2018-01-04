
# Spudnik ![Spudnik!](./Spudnik_icon.png?raw=true)
Spudnik is a robust chat bot focused on guild management and adding interesting and useful functionality to your server.

[![license](https://img.shields.io/github/license/richardson-media-house/Spudnik.svg?style=flat-square&colorB=00aaff)](https://github.com/richardson-media-house/Spudnik) [![Waffle.io](https://badge.waffle.io/Richardson-Media-House/Spudnik.svg?columns=all&style=flat-square)](https://waffle.io/richardson-media-house/Spudnik) [![Build Status](https://img.shields.io/travis/Richardson-Media-House/Spudnik.svg?style=flat-square)](https://github.com/richardson-media-house/Spudnik) [![XO code style](https://img.shields.io/badge/code_style-XO-000000.svg?style=flat-square)](https://github.com/sindresorhus/xo)

Invite the bot to your server: [here](https://discordapp.com/oauth2/authorize?client_id=398591330806398989&scope=bot&permissions=66186303).

# Modules

## Using Modules

Modules can be autoloaded from a single file in `./modules/module-name.js`.

## Official Modules
List of included modules for you to include with your installation (if you wish):

- antiraid => monitors join rates to prevent attempts to raid the server
- moderation => adds a collection of Discord-specific moderation commands
- musicplayer => adds commands to play music in voice channels
- welcome => adds the ability to add nicely formatted text to your welcome channel
- admin => adds a few administrative commands for server owners and bot admins to use
- beer-lookup => adds the !brew command
- cocktail-lookup => adds the !cocktail command
- dice => adds the !roll command
- dictionary => adds the !define command
- misc => adds misc commands that don't fall into other categories
- urbandictionary => adds the !urban command
- random => adds a bunch of random fact commands and fun stuff
- rss => adds rss feed related commands
- server => adds the !servers command, and the ability to list out a custom list of server info
- translator => adds translation commands
- wikipedia => adds the !wiki command
- xkcd => adds the !xkcd command

## Writing Modules
To write a Spudnik module, create a new file that exports an array named `commands` of triggers your bot will respond to. You can use a simple callback to display your message in both Slack and Discord, depending on the features you added:

```js
module.exports = (Spudnik) => {
	return {
		commands: [
			'hello'
		],
		hello: {
			description: 'responds with hello!',
			process: (msg, suffix, isEdit, cb) => { cb('hello!', msg); }
		}
	};
};
```

If you think your plugin is amazing, please let us know! We'd love to add it to our list.

# Installation

Written in Node.JS.

1. Clone the repo.
2. Run `npm install` in the repo directory.

For music playback, you will need [ffmpeg](https://www.ffmpeg.org/download.html) installed and in your path variables.

## Customization
The `config` directory contains example files for the configs, as well as some example commands, rss feeds, and more! These files need to be renamed, without the .example extension, and edited to include your `bot_token` and other settings.

# Running
Before first run you will need to create an `auth.json` file. A bot token is required. The other credentials are not required for the bot to run, but highly recommended as commands that depend on them will malfunction. See `auth.json.example`.

To start the bot just run
`npm run launch`.

# Updates
If you update the bot, please run `npm update` before starting it again. If you have
issues with this, you can try deleting your node_modules folder and then running
`npm install` again. Please see [Installation](#Installation).

# To Do:
Check out our our [status page](https://waffle.io/richardson-media-house/Spudnik).

[![Waffle.io](https://badge.waffle.io/Richardson-Media-House/Spudnik.svg?columns=all&style=flat-square)](https://waffle.io/richardson-media-house/Spudnik)

# Help
If you need help join us on [discord](https://discord.gg/A8a2yeP).

[![Discord](https://img.shields.io/discord/294483428651302924.svg?style=flat-square)](https://discord.gg/A8a2yeP)
