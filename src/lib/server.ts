import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import { Strategy } from 'passport-discord';
import * as helmet from 'helmet';
import * as mongo from 'connect-mongo';

export class Server {

	public app: express.Application;
	private scopes: string[] = ['identify', 'email', 'guilds', 'guilds.join'];

	public constructor() {
		this.app = express();
		this.config();
		this.routes();
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
			clientID,
			clientSecret,
			callbackURL: `${thisURL}:${port}/auth/callback`,
			scope: this.scopes
		}, (accessToken, refreshToken, profile, done) => {
			process.nextTick(() => done(null, profile));
		}));

		// set up express config
		this.app.use(session({
			secret: sessionSecret,
			resave: false,
			name: 'spudMin',
			saveUninitialized: false,
			cookie: {
				// domain: UIURL,
				// secure: true // TODO: Add this back in prod for SSL, maybe make some conditional shit here
			},
			store: new MongoStore({
				url: spudAdminDB,
				ttl: 24 * 60 * 60 // = 1 day.
			})
		}));
		this.app.use(passport.initialize());
		this.app.use(passport.session());
		this.app.use(helmet());
	}

	public routes() {
		this.app.use('/api', api);

		this.app.get('/auth/login', passport.authenticate('discord', { scope: this.scopes }));
		this.app.get('/auth/callback',
			passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
				res.redirect('/dashboard');
			});
		this.app.get('/auth/logout', (req, res) => {
			req.logout();
			res.redirect('/');
		});
		this.app.get('/auth/checkAuth', (req, res) => {
			req.isAuthenticated() ? res.json({ loggedIn: true }) : res.json({ loggedIn: false });
		});
	}

	public static launch(): Server {
		return new Server();
	}

}
