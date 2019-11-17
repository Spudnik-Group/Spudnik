import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { getEmbedColor, sendSimpleEmbeddedError, modLogMessage, isCommandCategoryEnabled, isCommandEnabled, commandOrCategory } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Disables a command or command category.
 *
 * @export
 * @class DisableCommand
 * @extends {Command}
 */
export default class DisableCommand extends Command {
	/**
	 * Creates an instance of DisableCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DisableCommand
	 */
    constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['disable-command', 'cmd-off', 'command-off'],
            description: 'Disables a command or command category.',
            extendedHelp: stripIndents`
				syntax: \`!disable <command|commandGroup>\`
				
				The argument must be the name/ID (partial or whole) of a command or command group.

				\`ADMINISTRATOR\` permission required.
			`,
            guarded: true,
            name: 'disable',
            usage: '<cmdOrCat:command|string>'
        });

        this.createCustomResolver('cmdOrCat', commandOrCategory)
    }

	/**
	 * Run the "DisableCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ cmdOrGrp: Command | CommandGroup }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DisableCommand
	 */
    public async run(msg: KlasaMessage, [cmdOrCat]): Promise<KlasaMessage | KlasaMessage[]> {
        const disableEmbed: MessageEmbed = new MessageEmbed({
            author: {
                icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/cross-mark_274c.png',
                name: 'Disable'
            },
            color: getEmbedColor(msg),
            description: ''
        }).setTimestamp();

        if (typeof cmdOrCat === 'string') {
            // category
            if (!isCommandCategoryEnabled(msg, cmdOrCat)) {
                return sendSimpleEmbeddedError(msg,
                    `The \`${cmdOrCat}\` category is already disabled.`, 3000);
            } else {
                msg.guild.settings.update('disabledCommandCategories', cmdOrCat.toLowerCase());
                disableEmbed.setDescription(stripIndents`
                **Moderator:** ${msg.author.tag} (${msg.author.id})
			    **Action:** Disabled the \`${cmdOrCat}\` category.`);
                modLogMessage(msg, disableEmbed);

                return msg.sendEmbed(disableEmbed);
            }
        } else {
            // command
            if (!isCommandEnabled(msg, cmdOrCat)) {
                return sendSimpleEmbeddedError(msg, `The \`${cmdOrCat.name}\` command is already disabled.`, 3000);
            } else {
                if (cmdOrCat.guarded) {
                    return sendSimpleEmbeddedError(msg,
                        `You cannot disable the \`${cmdOrCat.name}\` command.`, 3000
                    );
                }
                msg.guild.settings.update('disabledCommands', cmdOrCat.name.toLowerCase());
                disableEmbed.setDescription(stripIndents`
                **Moderator:** ${msg.author.tag} (${msg.author.id})
			    **Action:** Disabled the \`${cmdOrCat.name}\` command.`);
                modLogMessage(msg, disableEmbed);

                return msg.sendEmbed(disableEmbed);
            }
        }
    }
}
