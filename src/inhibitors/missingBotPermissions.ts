import { BitField, Permissions, PermissionString, TextChannel } from 'discord.js';
import { Command, Inhibitor, KlasaMessage } from 'klasa';
import { SpudnikCommand } from '@lib/structures/SpudnikCommand';

export default class extends Inhibitor {

	private defaultPerms: Readonly<BitField<PermissionString>> = new Permissions(515136).freeze();

	public run(message: KlasaMessage, command: Command): void {
		let missing: PermissionString[];

		if (message.guild) {
			const textChannel = message.channel as TextChannel;
			const permissions = textChannel.permissionsFor(message.guild.me!);

			if (!permissions) throw 'Failed to fetch permissions.';

			missing = permissions.missing(command.requiredPermissions, false);

			if (command instanceof SpudnikCommand && command.requiredGuildPermissions.bitfield !== 0) {
				const guildPermissions = message.guild.me!.permissions;
				missing = [...new Set(missing.concat(guildPermissions.missing(command.requiredGuildPermissions)))];
			}
		} else {
			missing = this.defaultPerms.missing(command.requiredPermissions, false);
		}

		if (missing.length) {
			throw `Insufficient permissions, missing: **${missing.join('**, **')}**`;
		}
	}

}
