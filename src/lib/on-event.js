module.exports = Spudnik => {
	require('./on-event/ready')(Spudnik);
	require('./on-event/message')(Spudnik);
	require('./on-event/guild-create')(Spudnik);
	require('./on-event/guild-delete')(Spudnik);
	require('./on-event/guild-member-add')(Spudnik);
	require('./on-event/guild-member-leave')(Spudnik);
	require('./on-event/disconnected')(Spudnik);
};
