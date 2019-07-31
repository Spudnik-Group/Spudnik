import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import Mongoose = require('mongoose');
import { Schema, Document, Model } from 'mongoose';
import { startTyping, stopTyping, sendSimpleEmbeddedError } from '../../lib/helpers';
import { getEmbedColor, modLogMessage, deleteCommandMessages } from '../../lib/custom-helpers';
import * as format from 'date-fns/format';

interface IWarningsObject {
	id: string;
	tag: string;
	points: number;
}
interface IWarnings {
	guild: string;
	warnings: IWarningsObject[];
}
interface IWarningsModel extends IWarnings, Document { }

const warningsSchema: Schema = new Schema({
	guild: String,
	warnings: Array
});
const conn = Mongoose.createConnection(process.env.spudCoreDB ? process.env.spudCoreDB : process.env.spud_mongo);
const warningModel: Model<IWarningsModel> = conn.model<IWarningsModel>('warning', warningsSchema);

/**
 * Clears warns for a member of the guild.
 *
 * @export
 * @class ClearWarnsCommand
 * @extends {Command}
 */
export default class ClearWarnsCommand extends Command {
	/**
	 * Creates an instance of ClearWarnsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ClearWarnsCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: [
				'clear-warn',
				'warn-clear'
			],
			args: [
				{
					key: 'member',
					prompt: 'Which member should I clear warnings for?',
					type: 'member'
				},
				{
					default: '',
					key: 'reason',
					prompt: 'What is the reason for clearing the warnings?',
					type: 'string'
				}
			],
			description: 'Clear warnings for the specified member.',
			details: stripIndents`
				syntax: \`!warn <@userMention> (reason)\`

				MANAGE_MESSAGES permission required.
			`,
			examples: [
				'!clear-warns @user he\'s been better',
				'!clear-warns @wrunt'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'clear-warns',
			name: 'clear-warns',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_MESSAGES']
		});
	}

	/**
	 * Run the "clear-warns" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof ClearWarnsCommand
	 */
	public async run(msg: CommandoMessage, args: { member: GuildMember, reason: string }): Promise<Message | Message[] | any> {
		const warnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png',
				name: 'Clear Warnings'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		let previousPoints = 0;

		startTyping(msg);

		// Check for guild's warnings
		warningModel.findOne({ guild: msg.guild.id }, (err: any, res: IWarningsModel) => {
			if (err) this.catchError(msg, args, err);
			if (res) {
				// Warnings present for current guild
				const warningsForCurrentGuild: IWarningsObject[] = res.warnings;
				// Check for previous warnings of currentMember
				const warningForCurrentMember = warningsForCurrentGuild.find((item) => {
					return item.id === args.member.id;
				});
				if (warningForCurrentMember) {
					// Previous warnings present
					previousPoints = warningForCurrentMember.points;
					// Update previous warning points
					warningModel.update({ 'guild': msg.guild.id, 'warnings.id': args.member.id }, { '$set': { 'warnings.$.points': 0 } }, (err: any) => {
						if (err) this.catchError(msg, args, err);
					});
					// Set up embed message
					warnEmbed.setDescription(stripIndents`
						**Moderator:** ${msg.author.tag} (${msg.author.id})
						**Member:** ${args.member.user.tag} (${args.member.id})
						**Action:** Clear Warns
						**Previous Warning Points:** ${previousPoints}
						**Current Warning Points:** 0
						**Reason:** ${args.reason !== '' ? args.reason : 'No reason has been added by the moderator'}`);
					
					modLogMessage(msg, warnEmbed);
					deleteCommandMessages(msg);
					stopTyping(msg);
		
					// Send the success response
					return msg.embed(warnEmbed);
				} else {
					// No previous warnings present
					deleteCommandMessages(msg);
					stopTyping(msg);
	
					return sendSimpleEmbeddedError(msg, 'No warnings present for the supplied member.');
				}

			} else {
				// No document for current guild
				deleteCommandMessages(msg);
				stopTyping(msg);
	
				return sendSimpleEmbeddedError(msg, 'No warnings present for the supplied member.');
			}
		});
	}
	
	private catchError(msg: CommandoMessage, args: { member: GuildMember, reason: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`clear-warns\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`${args.member.user.tag} (${args.member.id})\` || \`${args.reason}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		stopTyping(msg);
		
		return sendSimpleEmbeddedError(msg, `Clearing warnings for ${args.member} failed!`, 3000);
	}
}
