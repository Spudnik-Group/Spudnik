/* eslint-disable @typescript-eslint/no-namespace */
import { T } from './Shared';

export namespace ClientSettings {

	export namespace Blacklist {
		export const Guilds = T<string[]>('blacklist.guilds');
		export const Users = T<string[]>('blacklist.users');
	}

}
