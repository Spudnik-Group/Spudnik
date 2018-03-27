import { Guild } from 'discord.js';
import { Command, CommandGroup, CommandoClient, SettingProvider } from 'discord.js-commando';
import { Connection, Document, Model, model, Schema } from 'mongoose';

interface ISettings {
	guild: string;
	settings: string;
}

interface ISettingsModel extends ISettings, Document { }

const settingsSchema: Schema = new Schema({
	guild: String,
	settings: String,
});

export class MongoProvider extends SettingProvider {
	private db: Connection;
	private settings: Map<string, any>;
	private listeners: Map<string, any>;
	private client: CommandoClient;
	private model: Model<ISettingsModel>;

	constructor(db: Connection) {
		super();
		this.client = new CommandoClient();
		this.db = db;
		this.settings = new Map<string, any>();
		this.listeners = new Map<string, any>();
		this.model = model<ISettingsModel>('guildsettings', settingsSchema);
	}

	public async init(client: CommandoClient): Promise<void> {
		this.client = client;

		const rows: ISettingsModel[] = await this.model.find();
		for (const row of rows) {
			let settings: any;
			try {
				settings = JSON.parse(row.settings);
			} catch (err) {
				client.emit('warn', `MongoProvider couldn't parse the settings stored for guild ${row.guild}.`);
				continue;
			}

			const guild: string = row.guild !== '0' ? row.guild : 'global';

			this.settings.set(guild, settings);
			if (guild !== 'global' && !client.guilds.has(row.guild)) { continue; }
			this.setupGuild(guild, settings);
		}

		this.listeners
			.set('commandPrefixChange', (guild: string, prefix: string) => this.set(guild, 'prefix', prefix))
			.set('commandStatusChange', (guild: string, command: Command, enabled: boolean) => this.set(guild, `cmd-${command.name}`, enabled))
			.set('groupStatusChange', (guild: string, group: CommandGroup, enabled: boolean) => this.set(guild, `grp-${group.id}`, enabled))
			.set('guildCreate', (guild: Guild) => {
				const settings: any = this.settings.get(guild.id);
				if (!settings) { return; }
				this.setupGuild(guild.id, settings);
			})
			.set('commandRegister', (command: Command) => {
				for (const [guild, settings] of this.settings) {
					if (guild !== 'global' && !client.guilds.has(guild)) { continue; }
					const workingGuild: Guild | undefined = client.guilds.get(guild);
					if (workingGuild !== undefined) {
						this.setupGuildCommand(workingGuild, command, settings);
					}
				}
			})
			.set('groupRegister', (group: CommandGroup) => {
				for (const [guild, settings] of this.settings) {
					if (guild !== 'global' && !client.guilds.has(guild)) { continue; }
					const workingGuild: Guild | undefined = client.guilds.get(guild);
					if (workingGuild !== undefined) {
						this.setupGuildGroup(workingGuild, group, settings);
					}
				}
			});
		for (const [event, listener] of this.listeners) { client.on(event, listener); }
	}

	public async set(guild: string, key: string, val: any): Promise<void> {
		guild = (this.constructor as any).getGuildID(guild);
		let settings: any = this.settings.get(guild);
		if (!settings) {
			settings = {};
			this.settings.set(guild, settings);
		}

		settings[key] = val;
		await this.model.findOneAndUpdate({ guild: guild !== 'global' ? guild : '0' }, { guild: guild !== 'global' ? guild : '0', settings: JSON.stringify(settings) }, { upsert: true });
		if (guild === 'global') { this.updateOtherShards(key, val); }
	}

	public async destroy(): Promise<void> {
		for (const [event, listener] of this.listeners) { this.client.removeListener(event, listener); }
		this.listeners.clear();
	}

	public get(guild: string, key: string, defVal: any): any {
		const settings: any = this.settings.get((this.constructor as any).getGuildID(guild));
		return settings ? typeof settings[key] !== 'undefined' ? settings[key] : defVal : defVal;
	}

	public async remove(guild: string, key: string): Promise<string> {
		guild = (this.constructor as any).getGuildID(guild);
		const settings: any = this.settings.get(guild);
		if (!settings || typeof settings[key] === 'undefined') { return ''; }

		const val: any = settings[key];
		settings[key] = undefined;
		this.model.findOneAndUpdate({ guild: guild !== 'global' ? guild : '0' }, { guild: guild !== 'global' ? guild : '0', settings: JSON.stringify(settings) }, { upsert: true })
			.then(() => {
				if (guild === 'global') { this.updateOtherShards(key, undefined); }
				return new Promise<string>((resolve: (value: string) => void, reject: (value: string) => void) => {
					resolve(val);
				});
			}).catch((err: Error) => {
				console.error(err);
			});
		return '';
	}

	public async clear(guild: string): Promise<void> {
		guild = (this.constructor as any).getGuildID(guild);
		if (!this.settings.has(guild)) { return; }
		this.settings.delete(guild);
		await this.model.findOneAndRemove({ guild: guild !== 'global' ? guild : '0' });
	}

	public setupGuild(guild: string, settings: any): void {
		if (typeof guild !== 'string') {
			throw new TypeError('The guild must be a guild ID or "global".');
		}
		const guildObj: Guild | undefined = this.client.guilds.get(guild) || undefined;

		if (typeof settings.prefix !== 'undefined') {
			if (guildObj) {
				(guildObj as any)._commandPrefix = settings.prefix;
			} else {
				(this.client as any)._commandPrefix = settings.prefix;
			}
		}

		if (guildObj !== undefined) {
			for (const command of this.client.registry.commands.values()) { this.setupGuildCommand(guildObj, command, settings); }
			for (const group of this.client.registry.groups.values()) { this.setupGuildGroup(guildObj, group, settings); }
		}
	}

	public setupGuildCommand(guild: Guild, command: Command, settings: any): void {
		if (typeof settings[`cmd-${command.name}`] === 'undefined') { return; }
		if (guild) {
			if (!(guild as any)._commandsEnabled) { (guild as any)._commandsEnabled = {}; }
			(guild as any)._commandsEnabled[command.name] = settings[`cmd-${command.name}`];
		} else {
			(command as any)._globalEnabled = settings[`cmd-${command.name}`];
		}
	}

	public setupGuildGroup(guild: Guild, group: CommandGroup, settings: any): void {
		if (typeof settings[`grp-${group.id}`] === 'undefined') { return; }
		if (guild) {
			if (!(guild as any)._groupsEnabled) { (guild as any)._groupsEnabled = {}; }
			(guild as any)._groupsEnabled[group.id] = settings[`grp-${group.id}`];
		} else {
			(group as any)._globalEnabled = settings[`grp-${group.id}`];
		}
	}

	public updateOtherShards(key: string, val: any): void {
		if (!this.client.shard) { return; }
		key = JSON.stringify(key);
		val = typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined';
		this.client.shard.broadcastEval(`
			if(this.shard.id !== ${this.client.shard.id} && this.provider && this.provider.settings) {
				this.provider.settings.global[${key}] = ${val};
			}
		`);
	}
}
