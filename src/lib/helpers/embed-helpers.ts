/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getEmbedColor } from './custom-helpers';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

export enum specialEmbedTypes {
	RoleManager,
	DeleteCommandMessages,
	Disable,
	Enable,
	EmbedColor,
	Prefix,
	Announcement,
	Goodbye,
	Starboard,
	Welcome,
	Adblock,
	Modlog,
	Kick,
	Move,
	Mute,
	UnMute,
	Prune,
	Ban,
	SoftBan,
	UnBan,
	Warn,
	ClearWarn,
	Tos,
	Leave
}

// TODO: add jsdoc
export const baseEmbed = (msg: KlasaMessage): MessageEmbed => new MessageEmbed().setColor(getEmbedColor(msg));

// TODO: add jsdoc
export const specialEmbed = (msg: KlasaMessage, name: specialEmbedTypes): MessageEmbed => {
	const embedOut: MessageEmbed = baseEmbed(msg)
		.setTimestamp();
	switch (name) {
		case specialEmbedTypes.RoleManager: {
			embedOut
				.setAuthor(
					'Role Manager',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png'
				)
				.setFooter('Use the `iam`/`iamnot` commands to manage your roles');
			break;
		}
		case specialEmbedTypes.DeleteCommandMessages: {
			embedOut.setAuthor('🛑 Delete Command Messages');
			break;
		}
		case specialEmbedTypes.Disable: {
			embedOut
				.setAuthor(
					'Disable',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/cross-mark_274c.png'
				);
			break;
		}
		case specialEmbedTypes.Leave: {
			embedOut
				.setAuthor(
					'Leave',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/241/door_1f6aa.png'
				);
			break;
		}
		case specialEmbedTypes.Enable: {
			embedOut
				.setAuthor(
					'Enable',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/heavy-check-mark_2714.png'
				);
			break;
		}
		case specialEmbedTypes.EmbedColor: {
			embedOut
				.setAuthor(
					'Embed Color',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/artist-palette_1f3a8.png'
				);
			break;
		}
		case specialEmbedTypes.Prefix: {
			embedOut
				.setAuthor(
					'Prefix',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png'
				);
			break;
		}
		case specialEmbedTypes.Announcement: {
			embedOut
				.setAuthor(
					'Announcement',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/223/public-address-loudspeaker_1f4e2.png'
				);
			break;
		}
		case specialEmbedTypes.Goodbye: {
			embedOut
				.setAuthor(
					'Server Goodbye Message',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png'
				);
			break;
		}
		case specialEmbedTypes.Starboard: {
			embedOut
				.setAuthor(
					'Star Board',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png'
				);
			break;
		}
		case specialEmbedTypes.Welcome: {
			embedOut
				.setAuthor(
					'Server Welcome Message',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png'
				);
			break;
		}
		case specialEmbedTypes.Adblock: {
			embedOut.setAuthor('🛑 Adblock');
			break;
		}
		case specialEmbedTypes.Modlog: {
			embedOut
				.setAuthor(
					'Mod Log',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png'
				);
			break;
		}
		case specialEmbedTypes.Kick: {
			embedOut
				.setAuthor(
					'Get Out! - уходить!!',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/eject-symbol_23cf.png'
				);
			break;
		}
		case specialEmbedTypes.Move: {
			embedOut
				.setAuthor(
					'Move it!',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/rightwards-arrow-with-hook_21aa.png'
				);
			break;
		}
		case specialEmbedTypes.Mute: {
			embedOut
				.setAuthor(
					'Mute',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/223/speaker-with-cancellation-stroke_1f507.png'
				);
			break;
		}
		case specialEmbedTypes.UnMute: {
			embedOut
				.setAuthor(
					'Un-Mute',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/223/speaker-with-cancellation-stroke_1f507.png'
				);
			break;
		}
		case specialEmbedTypes.Prune: {
			embedOut
				.setAuthor(
					'Prune',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/black-scissors_2702.png'
				);
			break;
		}
		case specialEmbedTypes.Ban: {
			embedOut
				.setAuthor(
					'Ban Hammer',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png'
				);
			break;
		}
		case specialEmbedTypes.SoftBan: {
			embedOut
				.setAuthor(
					'Ban Hammer (Soft)',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png'
				);
			break;
		}
		case specialEmbedTypes.UnBan: {
			embedOut
				.setAuthor(
					'Un-Ban',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png'
				);
			break;
		}
		case specialEmbedTypes.Warn: {
			embedOut
				.setAuthor(
					'Warning',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png'
				);
			break;
		}
		case specialEmbedTypes.ClearWarn: {
			embedOut
				.setAuthor(
					'Clear Warnings',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png'
				);
			break;
		}
		case specialEmbedTypes.Tos: {
			embedOut
				.setAuthor(
					'Terms of Service',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png'
				);
			break;
		}
	}

	return embedOut;
};
