/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getEmbedColor } from './custom-helpers';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

export const baseEmbed = (msg: KlasaMessage): MessageEmbed => new MessageEmbed().setColor(getEmbedColor(msg));

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
	}

	return embedOut;
};
