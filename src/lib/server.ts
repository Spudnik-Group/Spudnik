import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import { Strategy } from 'passport-discord';
import * as helmet from 'helmet';
import * as mongo from 'connect-mongodb-session';
import { Client } from 'klasa';
import { SpudConfig } from './config/spud-config';
import chalk from 'chalk';
import { GuildSettings } from './types/settings/GuildSettings';
import * as fs from 'fs';
import { Command } from 'klasa';

// TODO: make this dynamic: use fs
const commandMap = {
	convert: [
		'base64decode',
		'base64encode',
		'bin2dec',
		'bin2hex',
		'dec2bin',
		'dec2hex',
		'hex2bin',
		'hex2dec'
	],
	dev: [
		'github',
		'mdn',
		'npm',
		'stack-overflow'
	],
	facts: [
		'cat-fact',
		'chuck-fact',
		'date-fact',
		'dog-fact',
		'math-fact',
		'smiff-fact',
		'year-fact'
	],
	game: [
		'apples-to-apples',
		'balloon-pop',
		'battle',
		'cards-against-humanity',
		'chance',
		'emoji-emoji-revolution',
		'fishy',
		'google-fued',
		'gunfight',
		'hangman',
		'hunger-games',
		'lottery',
		'mafia',
		'math-quiz',
		'quiz',
		'rock-paper-scissors',
		'roulette',
		'slots',
		'sorting-hat-quiz',
		'tic-tac-toe',
		'typing-test',
		'wizard-convention'
	],
	gaming: [
		'apex-legends-stats',
		'codbo4-stats',
		'codwwii-stats',
		'csgo-stats',
		'fortnite-stats',
		'go',
		'overwatch-stats',
		'r6-stats'
	],
	meme: [
		'gitgud',
		'highnoon'
	],
	misc: [
		'lmgtfy',
		'playing',
		'say',
		'strawpoll',
		'unshort',
		'xkcd'
	],
	mod: [
		'ban',
		'clear-warn',
		'kick',
		'list-warns',
		'move',
		'prune',
		'unban',
		'warn'
	],
	random: [
		'8ball',
		'bacon',
		'choose',
		'coinflip',
		'dice'
	],
	ref: [
		'beer-lookup',
		'cocktail-lookup',
		'dictionary',
		'urbandictionary',
		'wikipedia'
	],
	roles: [
		'accept',
		'iam',
		'iamnot',
		'role',
		'roles'
	],
	translate: [
		'leet',
		'yodafy'
	],
	util: [
		'nick',
		'pong',
		'server',
		'stats',
		'topic',
		'user'
	]
};

const groups: any[] = fs.readdirSync('commands')
	.filter(path => fs.statSync(`commands/${path}`).isDirectory());

export class Server {

	public app: express.Application;
	public client: Client;
	private scopes: string[] = ['identify', 'email', 'guilds', 'guilds.join'];

	public constructor(client: Client) {
		this.app = express();
		this.client = client;

		this.config();
		this.routes();
		this.startHeartbeat();
	}

	public config() {
		const MongoStore = (mongo)(session);

		// set up passport config
		passport.serializeUser((user, done) => {
			done(null, user);
		});
		passport.deserializeUser((obj, done) => {
			done(null, obj);
		});
		passport.use(new Strategy({
			clientID: SpudConfig.clientID,
			clientSecret: SpudConfig.clientSecret,
			callbackURL: `${SpudConfig.apiUrl}:${SpudConfig.port}/auth/callback`,
			scope: this.scopes
		}, (accessToken, refreshToken, profile, done) => {
			process.nextTick(() => done(null, profile));
		}));

		// set up express config
		this.app.use(session({
			secret: SpudConfig.sessionSecret,
			resave: false,
			name: 'spudMin',
			saveUninitialized: false,
			cookie: {
				// domain: UIURL,
				// secure: true // TODO: Add this back in prod for SSL, maybe make some conditional shit here
			},
			store: new MongoStore({
				uri: SpudConfig.spudAdminDBConnection,
				databaseName: SpudConfig.spudAdminDB,
				collection: 'sessions',
				ttl: 24 * 60 * 60 // = 1 day.
			})
		}));
		this.app.use(passport.initialize());
		this.app.use(passport.session());
		this.app.use(helmet());
	}

	public routes() {
		this.app
			.get('/auth/login', passport.authenticate('discord', { scope: this.scopes }))
			.get('/auth/callback',
				passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
					res.redirect('/dashboard');
				})
			.get('/auth/logout', (req, res) => {
				req.logout();
				res.redirect('/');
			})
			.get('/auth/checkAuth', (req, res) => {
				req.isAuthenticated() ? res.json({ loggedIn: true }) : res.json({ loggedIn: false });
			})

			.get('/api', (req, res) => {
				res.send('api works');
			})
			// return Discord user object
			.get('/api/info', this.checkAuth, (req, res) => {
				res.json(req.user);
			})
			// return status of all features and disabled categories
			.get('/api/info/guild/:guildId', this.checkAuth, async (req, res) => {
				const { guildId } = req.params;
				const settings = await this.client.guilds.get(guildId).settings;
				const response = {
					features: {
						prefix: settings.get(GuildSettings.Prefix),
						adblock: settings.get(GuildSettings.AdblockEnabled),
						commandMessages: settings.get(GuildSettings.Commands.DeleteCommandMessages),
						embedColor: settings.get(GuildSettings.EmbedColor),
						modlog: settings.get(GuildSettings.Modlog.Enabled),
						starboard: settings.get(GuildSettings.Starboard.Enabled),
						welcome: settings.get(GuildSettings.Welcome.Enabled),
						goodbye: settings.get(GuildSettings.Goodbye.Enabled)
					},
					categories: settings.get(GuildSettings.Commands.DisabledCategories)
				};

				res.json(response);
			})
			// return disabled commands for provided guild in the provided category
			.get('/api/info/guild/:guildId/commands/:category', this.checkAuth, async (req, res) => {
				const { guildId, category } = req.params;
				const disabledCommands = this.client.guilds.get(guildId).settings.get(GuildSettings.Commands.Disabled);

				res.json(disabledCommands);
			})
			// return status of a given feature
			.get('/api/info/guild/:guildId/feature/:featureName', this.checkAuth, async (req, res) => {
				const { guildId } = req.params;
				const currentGuildDoc = await GuildSettings.findOne({ guild: guildId });
				const settings = JSON.parse(currentGuildDoc.settings);
				let response = {};

				switch (req.params.featureName) {
					case ('starboard'): {
						response = {
							feature: 'starboard',
							enabled: settings.starboardEnabled ? settings.starboardEnabled : false,
							channel: settings.starboardChannel ? settings.starboardChannel : null,
							trigger: settings.starboardTrigger ? settings.starboardTrigger : '⭐'
						};
						break;
					}
					case ('welcome'): {
						response = {
							feature: 'welcome',
							enabled: settings.welcomeEnabled ? settings.welcomeEnabled : false,
							channel: settings.welcomeChannel ? settings.welcomeChannel : null,
							message: settings.welcomeMessage ? settings.welcomeMessage : '@here, please Welcome {user} to {guild}!'
						};
						break;
					}
					case ('goodbye'): {
						response = {
							feature: 'goodbye',
							enabled: settings.goodbyeEnabled ? settings.goodbyeEnabled : false,
							channel: settings.goodbyeChannel ? settings.goodbyeChannel : null,
							message: settings.goodbyeMessage ? settings.goodbyeMessage : '{user} has left the server.'
						};
						break;
					}
					case ('tos'): {
						response = {
							feature: 'tos',
							defaultRoles: settings.defaultRoles ? settings.defaultRoles : [],
							channel: settings.tosChannel ? settings.tosChannel : null,
							messageCount: settings.tosMessageCount ? settings.tosMessageCount : 0
						};
						// retrieve tosMessages
						break;
					}
					case ('roles'): {
						response = {
							feature: 'roles',
							assignableRoles: settings.assignableRoles ? settings.assignableRoles : []
						};
						break;
					}
				}

				res.json(response);
			});
		// toggle command group enabled/disabled

		// toggle command
	}

	private startHeartbeat() {
		this.app.get('/heartbeat', (req, res) => {
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('Ok!');
		});
		// Print URL for accessing server
		console.log(chalk.red(`Heartbeat running: ${SpudConfig.apiUrl}:${SpudConfig.port}/heartbeat`));
	}

	private checkAuth(req, res, next) {
		if (req.isAuthenticated()) {
			next();
		} else {
			res.status(403).send({
				errorMessage: 'You must be logged in.'
			});
		}
	}

}
