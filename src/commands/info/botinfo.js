module.exports = {
	name: 'botinfo',
	aliases: ['update', 'info', 'version', 'stats'],
	description: 'Displays various information about the bot.',
	long: 'Displays information about the current update and the bot.',
	args: {},
	examples: [],
	ignoreHelp: false,
	requiresAcc: false,
	requiresActive: false,
	guildModsOnly: false,

	async execute(app, message, { args, prefix }) {
		const used = process.memoryUsage().heapUsed / 1024 / 1024
		const stats = JSON.parse(await app.cache.get('stats')) || {}

		const embedInfo = new app.Embed()
			.setTitle('Jeremy Update Info')
			.setColor(13451564)
			.setThumbnail(app.bot.user.avatarURL)
			.setDescription('Read [here](https://lootcord.com/blog) for update details.\n\nLootcord is created by fans and is not affilated with Facepunch.')
			.addField('Shard ID', codeWrap(message.channel.guild.shard.id.toString(), 'js'), true)
			.addField('Cluster ID', codeWrap(app.clusterID.toString(), 'js'), true)
			.addField('Active Servers', codeWrap(stats.guilds || '1', 'js'), true)
			.addField('Uptime', codeWrap(app.cd.convertTime(app.bot.uptime), 'fix'), true)
			.addField('Memory Usage', codeWrap(`${Math.round(used)} MB`, 'fix'), true)
			.addField('Library', codeWrap('Eris', 'js'), true)
			.addField('Creators', 'OverTime#7858\nShteebr#0007', true)
			.addField('Website', 'https://lootcord.com', true)
			.addField('Discord', 'https://discord.gg/apKSxuE', true)

		message.channel.createMessage(embedInfo)
	}
}

function codeWrap(input, code) {
	return `\`\`\`${code}\n${input}\`\`\``
}
