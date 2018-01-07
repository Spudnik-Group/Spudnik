module.exports = Spudnik => {
	Spudnik.Discord.on('disconnected', () => {
		console.log('Disconnected from Discord!');
	});
};
