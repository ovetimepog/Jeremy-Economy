module.exports = {
	name: 'slots',
	aliases: ['slot'],
	description: 'Put some Scrap in the slot machine!',
	long: 'Play a game of slots.\n\nšµ šµ - **0.8x** multiplier\nšø šø - **1.5x** multiplier\nš° š° - **3x** multiplier\nš š - **5x** multiplier\nšµ šµ šµ - **2x** multiplier\nšø šø šø - **3x** multiplier\nš° š° š° - **6x** multiplier\nš š š - **10x** multiplier',
	args: { amount: 'Amount of Scrap to gamble.' },
	examples: ['slots 1000'],
	ignoreHelp: false,
	requiresAcc: true,
	requiresActive: true,
	guildModsOnly: false,

	async execute(app, message, { args, prefix }) {
		const row = await app.player.getRow(message.author.id)
		const slotsCD = await app.cd.getCD(message.author.id, 'slots')
		let gambleAmount = app.parse.numbers(args)[0]

		if (!gambleAmount && args[0] && args[0].toLowerCase() === 'all') {
			gambleAmount = row.scrap >= 1000000 ? 1000000 : row.scrap
		}

		if (slotsCD) {
			return message.reply(`You need to wait \`${slotsCD}\` before playing another game of slots.`)
		}

		if (!gambleAmount || gambleAmount < 100) {
			return message.reply(`Please specify an amount of at least **${app.common.formatNumber(100, false, true)}** to gamble!`)
		}

		if (gambleAmount > row.scrap) {
			return message.reply(`ā You don't have that much Scrap! You currently have **${app.common.formatNumber(row.scrap, false, true)}**. You can trade your ${app.icons.money} Racoin for ${app.icons.scrap} Scrap: \`${prefix}buy scrap <amount>\``)
		}

		if (gambleAmount > 1000000) {
			return message.reply(`You cannot gamble more than **${app.common.formatNumber(1000000, false, true)}**`)
		}

		await app.player.removeScrap(message.author.id, gambleAmount)
		const mainRowGif = app.icons.slots_midrow_gif
		const topRowGif = app.icons.slots_botrow_gif
		const botRowGif = app.icons.slots_toprow_gif
		const slotEmotes = [app.icons.slots_common_icon, app.icons.slots_rare_icon, app.icons.slots_epic_icon, app.icons.slots_legendary_icon]
		const col = {
			1: [],
			2: [],
			3: []
		}
		const slotFinal = []

		let winnings = 0
		let rewardMltp = 0.00 // used to check if user wins, also multiplies the amount user entered

		for (let i = 1; i <= 3; i++) {
			const chance = Math.floor(Math.random() * 200)
			if (chance <= 100) {
				// unbox common
				col[i].push(slotEmotes[3], slotEmotes[0], slotEmotes[1])
				slotFinal.push('common')
			}
			else if (chance <= 150) {
				// unbox rare
				col[i].push(slotEmotes[0], slotEmotes[1], slotEmotes[2])
				slotFinal.push('rare')
			}
			else if (chance <= 180) {
				col[i].push(slotEmotes[1], slotEmotes[2], slotEmotes[3])
				slotFinal.push('epic')
			}
			else {
				// legend
				col[i].push(slotEmotes[2], slotEmotes[3], slotEmotes[0])
				slotFinal.push('legend')
			}
		}
		if (slotFinal[0] === slotFinal[1] && slotFinal[1] === slotFinal[2]) {
			// all 3 match
			if (slotFinal[0] === 'common') {
				// 1x
				rewardMltp = 2.00
			}
			else if (slotFinal[0] === 'rare') {
				// 3x
				rewardMltp = 3.00
			}
			else if (slotFinal[0] === 'epic') {
				// 4x
				rewardMltp = 6.00
			}
			else if (slotFinal[0] === 'legend') {
				// 10x
				rewardMltp = 10.00
			}
		}
		else if (slotFinal[0] === slotFinal[1] || slotFinal[1] === slotFinal[2]) {
			// 2 of the same on left or right sides
			if (slotFinal[1] === 'common') {
				rewardMltp = 0.80
			}
			else if (slotFinal[1] === 'rare') {
				// 1.5x
				rewardMltp = 1.50
			}
			else if (slotFinal[1] === 'epic') {
				// 3x
				rewardMltp = 3.00
			}
			else if (slotFinal[1] === 'legend') {
				// 4x
				rewardMltp = 5.00
			}
		}

		winnings = Math.floor(gambleAmount * rewardMltp)
		await app.player.addScrap(message.author.id, winnings)

		if (winnings >= 2000000) {
			await app.itm.addBadge(message.author.id, 'gambler')
		}

		const template = `ā¬${topRowGif} ${topRowGif} ${topRowGif}ā¬\nā¶${mainRowGif} ${mainRowGif} ${mainRowGif}ā\nā¬${botRowGif} ${botRowGif} ${botRowGif}ā¬`

		const slotEmbed = new app.Embed()
			.setAuthor(message.member.nick || message.member.username, message.author.avatarURL)
			.setTitle('Slot Machine')
			.setDescription(template)

		const botMsg = await message.channel.createMessage(slotEmbed)

		const slots1 = `ā¬${col['1'][0]} ${topRowGif} ${topRowGif}ā¬\n` +
                        `ā¶${col['1'][1]} ${mainRowGif} ${mainRowGif}ā\n` +
                        `ā¬${col['1'][2]} ${botRowGif} ${botRowGif}ā¬`
		const slots2 = `ā¬${col['1'][0]} ${col['2'][0]} ${topRowGif}ā¬\n` +
                        `ā¶${col['1'][1]} ${col['2'][1]} ${mainRowGif}ā\n` +
                        `ā¬${col['1'][2]} ${col['2'][2]} ${botRowGif}ā¬`
		let slots3 = ''
		if (rewardMltp !== 0.00) {
			slots3 = `ā¬${col['1'][0]} ${col['2'][0]} ${col['3'][0]}ā¬\n` +
                        `ā¶${col['1'][1]} ${col['2'][1]} ${col['3'][1]}ā You won **${app.common.formatNumber(winnings, false, true)}** Scrap! (${rewardMltp.toFixed(2)}x)\n` +
                        `ā¬${col['1'][2]} ${col['2'][2]} ${col['3'][2]}ā¬`
		}
		else {
			slots3 = `ā¬${col['1'][0]} ${col['2'][0]} ${col['3'][0]}ā¬\n` +
                        `ā¶${col['1'][1]} ${col['2'][1]} ${col['3'][1]}ā You lost!\n` +
                        `ā¬${col['1'][2]} ${col['2'][2]} ${col['3'][2]}ā¬ Better luck next time.`
		}

		slotEmbed.setDescription(slots1)

		setTimeout(() => {
			botMsg.edit(slotEmbed)

			slotEmbed.setDescription(slots2)
		}, 1000)

		setTimeout(() => {
			botMsg.edit(slotEmbed)

			slotEmbed.setDescription(slots3)
			slotEmbed.setColor(rewardMltp !== 0.00 ? 720640 : 13632027)
		}, 2000)

		setTimeout(() => {
			botMsg.edit(slotEmbed)
		}, 3400)

		await app.cd.setCD(message.author.id, 'slots', app.config.cooldowns.slots * 1000)
	}
}
