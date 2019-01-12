import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import Mongoose = require('mongoose');
import { Schema, Document, Model } from 'mongoose';
import { startTyping, stopTyping, deleteCommandMessages, sendSimpleEmbeddedError } from '../../lib/helpers';
import { getEmbedColor, modLogMessage } from '../../lib/custom-helpers';
import moment = require('moment');

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
const conn = Mongoose.createConnection(process.env.spud_mongo);
const warningModel: Model<IWarningsModel> = conn.model<IWarningsModel>('warning', warningsSchema);

/**
 * Warn a member of the guild.
 *
 * @export
 * @class WarnCommand
 * @extends {Command}
 */
export default class WarnCommand extends Command {
	/**
	 * Creates an instance of WarnCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof WarnCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'member',
					prompt: 'Which member should I give a warning?',
					type: 'member'
				},
				{
					key: 'points',
					prompt:
						'How many warning points should I give this member?',
					type: 'integer'
				},
				{
					default: '',
					key: 'reason',
					prompt: 'What is the reason for this warning?',
					type: 'string'
				}
			],
			description: 'Warn a member with a specified amount of points',
			details: stripIndents`
				syntax: \`!warn <@userMention> <points> (reason)\`

				MANAGE_MESSAGES permission required.
			`,
			examples: [
				'!warn @user 5',
				'!warn @wrunt 9000 being himself'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'warn',
			name: 'warn',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_MESSAGES']
		});
	}

	/**
	 * Run the "Warn" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ member: GuildMember, points: number, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof WarnCommand
	 */
	public async run(msg: CommandMessage, args: { member: GuildMember, points: number, reason: string }): Promise<Message | Message[] | any> {
		const modlogChannel = msg.guild.settings.get('modlogchannel', null);
		const warnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png',
				name: 'Warning'
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
				const warningForCurrentMember = warningsForCurrentGuild.filter((item) => {
					return item.id === args.member.id;
				});
				if (warningForCurrentMember.length) {
					// Previous warnings present
					previousPoints = warningForCurrentMember[0].points;
					// Update previous warning points
					warningModel.update({ 'guild': msg.guild.id, 'warnings.id': args.member }, { '$set': { 'warnings.$.points': args.points + previousPoints } }, (err: any, raw: any) => {
						if (err) this.catchError(msg, args, err);
					});
				} else {
					// No previous warnings present
					// Update document with new warning
					warningModel.update({ 'guild': msg.guild.id }, { '$push': { 'warnings': {'id': args.member.id, 'points': args.points, 'tag': args.member.user.tag} } }, (err: any) => {
						if (err) this.catchError(msg, args, err);
					});
				}
			} else {
				// No document for current guild
				let newWarning = new warningModel({
					guild: msg.guild.id,
					warnings: [
						{
							id: args.member.id,
							points: args.points,
							tag: args.member.user.tag
						}
					]
				});
				newWarning.save((err: any, item: IWarningsModel) => {
					if (err) this.catchError(msg, args, err);
				});
			}

			// Set up embed message
			warnEmbed.setDescription(stripIndents`
				**Member:** ${args.member.user.tag} (${args.member.id})
				**Action:** Warn
				**Previous Warning Points:** ${previousPoints}
				**Current Warning Points:** ${args.points + previousPoints}
				**Reason:** ${args.reason !== '' ? args.reason : 'No reason has been added by the moderator'}`);
			
			// Log the event in the mod log
			if (msg.guild.settings.get('modlogs', true)) {
				modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, warnEmbed);
			}
			deleteCommandMessages(msg, this.client);
			stopTyping(msg);

			// Send the success response
			return msg.embed(warnEmbed);
		});
	}
	
	private catchError(msg: CommandMessage, args: { member: GuildMember, points: number, reason: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`warn\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${moment(msg.createdTimestamp).format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`${args.member.user.tag} (${args.member.id})\`|| \`${args.points}\` || \`${args.reason}\`
		**Error Message:** ${err}`);
		// Inform the user the command failed
		stopTyping(msg);
		return sendSimpleEmbeddedError(msg, `Warning ${args.member} failed!`);
	}
}
