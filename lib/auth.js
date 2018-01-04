function auth() {
	try {
		return require('../config/auth');
	} catch (err) {
		throw new Error(`Please create an auth.json like auth.json.example with a bot token or an email and password.\n${err.stack}`);
	}
}

module.exports = auth();
