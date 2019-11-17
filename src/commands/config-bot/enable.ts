import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { modLogMessage, getEmbedColor, sendSimpleEmbeddedError, commandOrCategory, isCommandCategoryEnabled, isCommandEnabled } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Enables a command or command group.
 *
 * @export
 * @class EnableCommand
 * @extends {Command}
 */
export default class EnableCommand extends Command {
	/**
	 * Creates an instance of EnableCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof EnableCommand
	 */
    constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['enable-command', 'cmd-off', 'command-off'],
            description: 'Enables a command or command group.',
            extendedHelp: stripIndents`
				syntax: \`!disable <command|commandGroup>\`
				
				The argument must be the name/ID (partial or whole) of a command or command group.

				\`ADMINISTRATOR\` permission required.
			`,
            guarded: true,
            name: 'enable',
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
	 * @memberof EnableCommand
	 */
    public async run(msg: KlasaMessage, [cmdOrCat]): Promise<KlasaMessage | KlasaMessage[]> {
        const enableEmbed: MessageEmbed = new MessageEmbed({
            author: {
                icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/heavy-check-mark_2714.png',
                name: 'Enable'
            },
            color: getEmbedColor(msg),
            description: ''
        }).setTimestamp();

        if (typeof cmdOrCat === 'string') {
            // category
            if (!isCommandCategoryEnabled(msg, cmdOrCat)) {
                return sendSimpleEmbeddedError(msg,
                    `The \`${cmdOrCat}\` category is already enabled.`, 3000);
            } else {
                msg.guild.settings.update('disabledCommandCategories', cmdOrCat.toLowerCase());
                enableEmbed.setDescription(stripIndents`
                **Moderator:** ${msg.author.tag} (${msg.author.id})
			    **Action:** Enabled the \`${cmdOrCat}\` category.`);
                modLogMessage(msg, enableEmbed);

                return msg.sendEmbed(enableEmbed);
            }
        } else {
            // command
            if (!isCommandEnabled(msg, cmdOrCat)) {
                return sendSimpleEmbeddedError(msg, `The \`${cmdOrCat.name}\` command is already enabled.`, 3000);
            } else {
                msg.guild.settings.update('disabledCommands', cmdOrCat.name.toLowerCase());
                enableEmbed.setDescription(stripIndents`
                **Moderator:** ${msg.author.tag} (${msg.author.id})
			    **Action:** Enabled the \`${cmdOrCat.name}\` command${
                    !isCommandCategoryEnabled(msg, cmdOrCat.category) ? `, but the \`${cmdOrCat.category}\` category is disabled, so it still can't be used` : ''}.`);
                modLogMessage(msg, enableEmbed);

                return msg.sendEmbed(enableEmbed);
            }
        }
    }
}
