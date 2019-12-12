import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { modLogMessage, getEmbedColor, sendSimpleEmbeddedError, commandOrCategory, isCommandCategoryEnabled, isCommandEnabled, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import * as fs from 'fs';

/**
 * Enables a command or command group.
 *
 * @export
 * @class EnableCommand
 * @extends {Command}
 */
export default class EnableCommand extends Command {

    constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
        super(client, store, file, directory, {
            aliases: ['enable-command', 'cmd-off', 'command-off'],
            description: 'Enables a command or command group.',
            guarded: true,
            name: 'enable',
            permissionLevel: 6, // MANAGE_GUILD
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
            const groups: any[] = fs.readdirSync('commands')
                .filter(path => fs.statSync(`commands/${path}`).isDirectory());
            const parsedGroup: string = cmdOrCat.toLowerCase();

            if (!isCommandCategoryEnabled(msg, cmdOrCat)) {
                return sendSimpleEmbeddedError(msg,
                    `The \`${cmdOrCat}\` category is already enabled.`, 3000);
            } else if (groups.find((g: string) => g === parsedGroup)) {
                await msg.guild.settings.update('disabledCommandCategories', cmdOrCat.toLowerCase(), msg.guild);

                enableEmbed.setDescription(stripIndents`
                **Moderator:** ${msg.author.tag} (${msg.author.id})
			    **Action:** Enabled the \`${cmdOrCat}\` category.`);
                modLogMessage(msg, enableEmbed);

                return msg.sendEmbed(enableEmbed);
            } else {
                return sendSimpleEmbeddedMessage(msg, `No groups matching that name. Use \`${msg.guild.settings.get('prefix')}commands\` to view a list of command groups.`, 3000);
            }
        } else {
            // command
            if (!isCommandEnabled(msg, cmdOrCat)) {
                return sendSimpleEmbeddedError(msg, `The \`${cmdOrCat.name}\` command is already enabled.`, 3000);
            } else {
                await msg.guild.settings.update('disabledCommands', cmdOrCat.name.toLowerCase(), msg.guild);

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
