import { Message } from 'discord.js';
import { Spudnik } from '../../spudnik';

module.exports = (Spudnik: Spudnik) => {
	function checkMessageForCommand(msg: Message, isEdit: boolean) {
		// Drop our own messages to prevent feedback loops
		if (msg.author === Spudnik.Discord.user) {
			return;
		}
		if (msg.channel.type === 'dm') {
			msg.channel.send("I don't respond to direct messages. Besides this response, of course.");
			return;
		}
		if (msg.isMentioned(Spudnik.Discord.user)) {
			//TODO: Add some cool AI shazz here

			msg.channel.send('Yes?');
			return;
		}

		// Check if message is a command
		if (msg.content.startsWith(Spudnik.Config.getCommandPrefix())) {
			const commands = Spudnik.Commands;
			const cmdTxt = msg.content.split(' ')[0].substring(Spudnik.Config.getCommandPrefix().length).toLowerCase();
			const suffix = msg.content.substring(cmdTxt.length + Spudnik.Config.getCommandPrefix().length + 1); // Add one for the ! and one for the space
			const cmd = commands[cmdTxt];

			if (cmd) {
				try {
					console.log(`Treating ${msg.content} from ${msg.guild.id}:${msg.author} as command`);
					cmd.process(msg, suffix);
				} catch (err) {
					let msgTxt = `Command ${cmdTxt} failed :disappointed_relieved:`;
					if (Spudnik.Config.getDebug()) {
						msgTxt += `\n${err.stack}`;
					}
					msg.channel.send(msgTxt);
				}
			} else {
				return Spudnik.processMessage(Spudnik.defaultEmbed(`${cmdTxt} not recognized as a command!`), msg, true, false);
			}
		}
	}

	Spudnik.Discord.on('message', (msg: Message) => checkMessageForCommand(msg, false));
};
