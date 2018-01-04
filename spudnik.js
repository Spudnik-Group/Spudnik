const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Discord = require('discord.js');
const Mongoose = require('mongoose');

console.log(chalk.blue(`3...\n2...\n1...\nLAUNCH`));
console.log(chalk.blue(`---Spudnik Stage 1 Engaged.---`));
console.log(chalk.green(`Node version: ${process.version}`));

// Helpers
this.require = filePath => {
	delete require.cache[path.join(path.dirname(require.main.filename), filePath)];
	return require(path.join(path.dirname(require.main.filename), filePath))(this);
};
this.getFileContents = filePath => {
	try {
		return fs.readFileSync(path.join(path.dirname(require.main.filename), filePath), 'utf-8');
	} catch (err) {
		console.log(chalk.red(err));
		return '';
	}
};
this.getFileArray = srcPath => {
	try {
		srcPath = path.join(path.dirname(require.main.filename), srcPath);
		return fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isFile());
	} catch (err) {
		console.log(chalk.red(err));
		return [];
	}
};
this.getJsonObject = filePath => {
	return JSON.parse(this.getFileContents(filePath));
};
this.resolveMention = usertxt => {
	let userid = usertxt;
	if (usertxt.startsWith('<@!')) {
		userid = usertxt.substr(3, usertxt.length - 4);
	} else if (usertxt.startsWith('<@')) {
		userid = usertxt.substr(2, usertxt.length - 3);
	}
	return userid;
};

this.Auth = require('./lib/auth');
this.Config = require('./lib/config');
this.Permissions = require('./lib/permissions');

// Set up database
if (!this.Config.databases) {
	throw new Error('There is no database settings specified in the config file.');
} else if (!this.Config.databases.mongodb) {
	throw new Error('There is no mongodb settings specified in the config file.');
} else if (!this.Config.databases.mongodb.connection) {
	throw new Error('There is no mongodb connection specified in the config file.');
}

// Get the settings and build the connection.
const settings = this.Config.databases.mongodb;

// Connect to the database
Mongoose.connect(`mongodb://${settings.connection}`, (settings.options || {}), error => {
	if (error) {
		throw error;
	}
	console.log(`Successfully connected to MongoDB at ${settings.connection}.`);
});

// Specify the databases value if Spudnik doesn't already have one.
if (!this.Databases) {
	this.Databases = {};
}

// Set the connection.
this.Databases.mongodb = Mongoose;

const defaultDatabase = this.Config.databases.default;
if (!defaultDatabase || defaultDatabase === 'mongodb') {
	// If the default database driver isn't specified or is mongodb,
	// set it as the current database
	this.Database = this.Databases.mongodb;
	console.log('Set current database driver to mongodb.');
}

// Load commands
require('./lib/commands')(this);

// Initialize AI
if (this.Config.elizaEnabled && !this.Eliza) {
	const Eliza = require('./extras/eliza');
	this.Eliza = new Eliza();
	console.log('Eliza enabled.');
	this.Eliza.memSize = 500;
}

// Bot login
this.Discord = new Discord.Client();
console.log(chalk.blue(`---Spudnik Stage 2 Engaged.---`));
console.log(chalk.magenta(`Discord.js version: ${Discord.version}`));
if (this.Auth.bot_token) {
	console.log(chalk.magenta('Logging in to Discord...'));
	this.Discord.login(this.Auth.bot_token);
	require('./lib/on-event')(this);
} else {
	console.log(chalk.red('ERROR: Spudnik must have a Discord bot token...'));
}

console.log(chalk.blue(`---SPUDNIK LAUNCH SUCCESS...---`));
