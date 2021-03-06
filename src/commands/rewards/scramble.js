module.exports = {
	name: 'scramble',
	aliases: [''],
	description: 'Unscramble a random word!',
	long: 'Unscramble a random word for a reward! Rewards vary depending on difficulty you choose, and the difficulty of the word.',
	args: { difficulty: 'easy or hard' },
	examples: ['scramble easy'],
	ignoreHelp: false,
	requiresAcc: true,
	requiresActive: true,
	guildModsOnly: false,

	async execute(app, message, { args, prefix }) {
		const scrambleCD = await app.cd.getCD(message.author.id, 'scramble')

		if (scrambleCD) {
			return message.reply(`You need to wait \`${scrambleCD}\` before playing another game of scramble.`)
		}

		const itemCt = await app.itm.getItemCount(await app.itm.getItemObject(message.author.id), await app.player.getRow(message.author.id))
		const option = args[0] ? args[0].toLowerCase() : undefined
		const scrambleJSONlength = Object.keys(app.scramble_words).length
		const chance = Math.floor(Math.random() * scrambleJSONlength) // returns value 0 between 32 (1 of 10)
		const scrambleWord = app.scramble_words[chance].word // json data word to scramble
		const scrambleDifficulty = app.scramble_words[chance].difficulty
		const finalWord = scrambleWord.toLowerCase() // final word to check if user got correct
		const reward = {}
		let scrambleHint = app.scramble_words[chance].define

		if (Math.random() <= 0.7) {
			scrambleHint = app.scramble_words[chance].hint
		}

		if (!option || (option !== 'easy' && option !== 'hard')) {
			return message.reply(`You need to choose a difficulty \`${prefix}scramble easy/hard\`\nEasy: Hint but less reward\nHard: Better reward, no hint`)
		}

		const embedScramble = new app.Embed()
			.setFooter('You have 30 seconds to unscramble this word.')

		if (option === 'easy') {
			embedScramble.setDescription(`**Hint:** ${scrambleHint}\nWord: \`\`\`fix\n${shuffleWordNoDupe(scrambleWord)}\`\`\``)
			if (scrambleDifficulty === 'hard') {
				const hasEnough = await app.itm.hasSpace(itemCt, 1)

				if (hasEnough) {
					reward.display = `${app.itemdata.crate.icon}\`crate\``
					reward.item = 'crate'
					reward.amount = 1
				}
				else {
					reward.display = app.common.formatNumber(2750)
					reward.item = 'money'
					reward.amount = 2750
				}
			}
			else if (scrambleDifficulty === 'medium') {
				const hasEnough = await app.itm.hasSpace(itemCt, 1)

				if (hasEnough) {
					reward.display = `${app.itemdata.crate.icon}\`crate\``
					reward.item = 'crate'
					reward.amount = 1
				}
				else {
					reward.display = app.common.formatNumber(1950)
					reward.item = 'money'
					reward.amount = 1950
				}
			}
			else {
				const hasEnough = await app.itm.hasSpace(itemCt, 1)

				if (hasEnough) {
					reward.display = `${app.itemdata.crate.icon}\`crate\``
					reward.item = 'crate'
					reward.amount = 1
				}
				else {
					reward.display = app.common.formatNumber(1700)
					reward.item = 'money'
					reward.amount = 1700
				}
			}
		}
		else if (option === 'hard') {
			embedScramble.setDescription(`Word: \`\`\`fix\n${shuffleWordNoDupe(scrambleWord.toLowerCase())}\`\`\``)

			if (scrambleDifficulty === 'hard') {
				const hasEnough = await app.itm.hasSpace(itemCt, 1)

				if (hasEnough) {
					reward.display = `${app.itemdata.military_crate.icon}\`military_crate\``
					reward.item = 'military_crate'
					reward.amount = 1
				}
				else {
					reward.display = app.common.formatNumber(8500)
					reward.item = 'money'
					reward.amount = 8500
				}
			}
			else if (scrambleDifficulty === 'medium') {
				const hasEnough = await app.itm.hasSpace(itemCt, 1)

				if (hasEnough) {
					reward.display = `1x ${app.itemdata.crate.icon}\`crate\``
					reward.item = 'crate'
					reward.amount = 1
				}
				else {
					reward.display = app.common.formatNumber(4600)
					reward.item = 'money'
					reward.amount = 4600
				}
			}
			else {
				const hasEnough = await app.itm.hasSpace(itemCt, 1)

				if (hasEnough) {
					reward.display = `1x ${app.itemdata.crate.icon}\`crate\``
					reward.item = 'crate'
					reward.amount = 1
				}
				else {
					reward.display = app.common.formatNumber(3750)
					reward.item = 'money'
					reward.amount = 3750
				}
			}
		}

		embedScramble.addField('Reward', reward.display)

		if (scrambleDifficulty === 'hard') {
			embedScramble.setColor(16734296)
		}
		else if (scrambleDifficulty === 'medium') {
			embedScramble.setColor(15531864)
		}
		else {
			embedScramble.setColor(9043800)
		}

		try {
			const collectorObj = app.msgCollector.createUserCollector(message.author.id, message.channel.id, m => m.author.id === message.author.id, { time: 30000 })

			await app.cd.setCD(message.author.id, 'scramble', app.config.cooldowns.scramble * 1000)

			message.channel.createMessage(embedScramble)

			collectorObj.collector.on('collect', async m => {
				if (m.content.toLowerCase() === finalWord) {
					app.msgCollector.stopCollector(collectorObj)

					if (reward.item === 'money') {
						await app.player.addMoney(message.author.id, reward.amount)
					}
					else {
						await app.itm.addItem(message.author.id, reward.item, reward.amount)
					}

					const winScramble = new app.Embed()
						.setTitle('You got it correct!')
						.addField('Reward', reward.display)
						.setColor(9043800)

					message.channel.createMessage(winScramble)
				}
			})

			collectorObj.collector.on('end', reason => {
				if (reason === 'time') {
					const lostScramble = new app.Embed()
						.setTitle('You didn\'t get it in time!')
						.setDescription(`The word was: \`\`\`\n${scrambleWord}\`\`\``)
						.setColor(16734296)

					message.channel.createMessage(lostScramble)
				}
			})
		}
		catch (err) {
			message.reply('??? You already have a command waiting for your input! If you believe this is the bot\'s fault, join our support discord! `discord`')
		}
	}
}

function shuffle(word) {
	let shuffledWord = ''
	word = word.split('')
	while (word.length > 0) {
		shuffledWord += word.splice(word.length * Math.random() << 0, 1)
	}
	return shuffledWord
}

function shuffleWordNoDupe(word) {
	let shuffled = shuffle(word)

	while (shuffled === word) {
		shuffled = shuffle(word)
	}

	return shuffled
}
