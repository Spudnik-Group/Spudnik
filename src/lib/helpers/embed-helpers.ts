/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getEmbedColor } from './custom-helpers';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

// TODO: add jsdoc
export const baseEmbed = (msg: KlasaMessage): MessageEmbed => new MessageEmbed().setColor(getEmbedColor(msg));

// TODO: add jsdoc
export const specialEmbed = (msg: KlasaMessage, name: string): MessageEmbed => {
	const embedOut: MessageEmbed = baseEmbed(msg)
		.setTimestamp();
	switch (name) {
		case 'role-manager': {
			embedOut
				.setAuthor(
					'Role Manager',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png'
				)
				.setFooter('Use the `iam`/`iamnot` commands to manage your roles');
			break;
		}
		case 'delete-command-messages': {
			embedOut.setAuthor('🛑 Delete Command Messages');
			break;
		}
		case 'disable': {
			embedOut
				.setAuthor(
					'Disable',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/cross-mark_274c.png'
				);
			break;
		}
		case 'enable': {
			embedOut
				.setAuthor(
					'Enable',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/heavy-check-mark_2714.png'
				);
			break;
		}
		case 'embed-color': {
			embedOut
				.setAuthor(
					'Embed Color',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/artist-palette_1f3a8.png'
				);
			break;
		}
		case 'prefix': {
			embedOut
				.setAuthor(
					'Prefix',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png'
				);
			break;
		}
		case 'announcement': {
			embedOut
				.setAuthor(
					'Announcement',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/223/public-address-loudspeaker_1f4e2.png'
				);
			break;
		}
		case 'goodbye': {
			embedOut
				.setAuthor(
					'Server Goodbye Message',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png'
				);
			break;
		}
		case 'starboard': {
			embedOut
				.setAuthor(
					'Star Board',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/133/white-medium-star_2b50.png'
				);
			break;
		}
		case 'welcome': {
			embedOut
				.setAuthor(
					'Server Welcome Message',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/waving-hand-sign_1f44b.png'
				);
			break;
		}
		case 'adblock': {
			embedOut.setAuthor('🛑 Adblock');
			break;
		}
		case 'modlog': {
			embedOut
				.setAuthor(
					'Mod Log',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/memo_1f4dd.png'
				);
			break;
		}
		case 'kick': {
			embedOut
				.setAuthor(
					'Get Out! - уходить!!',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/eject-symbol_23cf.png'
				);
			break;
		}
		case 'move': {
			embedOut
				.setAuthor(
					'Move it!',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/rightwards-arrow-with-hook_21aa.png'
				);
			break;
		}
		case 'mute': {
			embedOut
				.setAuthor(
					'Mute',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/223/speaker-with-cancellation-stroke_1f507.png'
				);
			break;
		}
		case 'un-mute': {
			embedOut
				.setAuthor(
					'Un-Mute',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/223/speaker-with-cancellation-stroke_1f507.png'
				);
			break;
		}
		case 'prune': {
			embedOut
				.setAuthor(
					'Prune',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/black-scissors_2702.png'
				);
			break;
		}
		case 'ban': {
			embedOut
				.setAuthor(
					'Ban Hammer',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png'
				);
			break;
		}
		case 'soft-ban': {
			embedOut
				.setAuthor(
					'Ban Hammer (Soft)',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png'
				);
			break;
		}
		case 'un-ban': {
			embedOut
				.setAuthor(
					'Un-Ban',
					'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png'
				);
			break;
		}
		case 'warn': {
			embedOut
				.setAuthor(
					'Warning',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png'
				);
			break;
		}
		case 'clear-warn': {
			embedOut
				.setAuthor(
					'Clear Warnings',
					'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png'
				);
			break;
		}
	}

	return embedOut;
};
