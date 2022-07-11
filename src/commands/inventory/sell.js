const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const coolDown = require('../../config/cooldown');
const emoji = require('../../config/emoji');
const configSell = require('../../config/sell');

const reminderCaptcha = require('../../utils/humanVerify/reminderCaptcha');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'sell',
			aliases: ['sell'],
			description: 'commands/sell:description',
			usage: 'commands/sell:usage',
			example: 'commands/sell:example'
		});
	}

	async messageRun(message, args) {
		try {
			let isBlock = await this.container.client.db.checkIsBlock(message.author.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${message.author.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(message, this.container.client, message.author.id, message.author.tag);
			}
			//check subcommand
			const t = await fetchT(message);
			let input = await args.next();
			if (!['fish'].includes(input)) {
				return send(
					message,
					t('commands/sell:fisherrorinput', {
						user: message.author.tag,
						prefix: await this.container.client.fetchPrefix(message)
					})
				);
			}
			const checkCoolDown = await this.container.client.checkTimeCoolDown(message.author.id, this.name, coolDown.inventory.sell, t);
			if (checkCoolDown) {
				return send(message, checkCoolDown);
			}
			//valid
			let name = await args.next();
			let amount;
			if (name === 'all') {
				amount = 'all';
				name = null;
			} else if (name === null) {
				return send(
					message,
					t('commands/sell:fisherrorinput', {
						user: message.author.tag,
						prefix: await this.container.client.fetchPrefix(message)
					})
				);
			} else {
				amount = await args.next();
				if (amount !== 'all' && isNaN(amount)) {
					return send(
						message,
						t('commands/sell:fisherrorinput', {
							user: message.author.tag,
							prefix: await this.container.client.fetchPrefix(message)
						})
					);
				} else if (amount === null) {
					amount = 1;
				}
			}
			switch (input) {
				case 'fish':
					return await this.sellFish(message, t, message.author.id, message.author.tag, name, amount);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async sellFish(message, t, userId, tag, name, amount) {
		if (amount !== 'all' && isNaN(amount) && Number(amount) < 1) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/sell:fisherrorinput', {
					user: message.author.tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		const itemFish = await this.container.client.db.getItemFishByDiscordId(userId);
		let arrayFish = itemFish.arrayFish.slice();
		let moneyReceive = 0;
		let map = new Map();
		configSell.fishing.forEach((object) => {
			map.set(object.name, object.price);
		});
		let allFishSell = '';
		if (name === null) {
			//case sell all fish
			for (let i = 0; i < arrayFish.length; i++) {
				if (arrayFish[i].amount > 0 && map.has(arrayFish[i].name)) {
					allFishSell += `${arrayFish[i].emoji} x ${arrayFish[i].amount} `;
					moneyReceive += arrayFish[i].amount * map.get(arrayFish[i].name);
					arrayFish[i].amount = 0;
				}
			}
		} else {
			let flag = 0;
			for (let i = 0; i < arrayFish.length; i++) {
				if (arrayFish[i].name === name && map.has(arrayFish[i].name)) {
					flag = 1;
					if (amount === 'all') {
						if (arrayFish[i].amount === 0) {
							return await utils.returnSlashAndMessage(
								message,
								t('commands/sell:notenoughamout', {
									user: tag
								})
							);
						}
						amount = arrayFish[i].amount;
						arrayFish[i].amount = 0;
					} else if (arrayFish[i].amount < Number(amount)) {
						return await utils.returnSlashAndMessage(
							message,
							t('commands/sell:notenoughamout', {
								user: tag
							})
						);
					} else {
						arrayFish[i].amount = arrayFish[i].amount - Number(amount);
					}
					allFishSell += `${arrayFish[i].emoji} x ${amount} `;
					moneyReceive += Number(amount) * map.get(arrayFish[i].name);
					break;
				}
			}
			if (flag === 0) {
				return await utils.returnSlashAndMessage(
					message,
					t('commands/sell:noitem', {
						user: tag
					})
				);
			}
		}
		await Promise.all([
			this.container.client.db.updateUser(userId, {
				$inc: {
					money: moneyReceive
				}
			}),
			this.container.client.db.updateItemFish(userId, {
				arrayFish: arrayFish
			})
		]);
		return await utils.returnSlashAndMessage(
			message,
			t('commands/sell:fishdone', {
				user: tag,
				arrayFish: allFishSell,
				amount: moneyReceive,
				moneyEmo: emoji.common.money
			})
		);
	}

	async execute(interaction) {
		try {
			let isBlock = await this.container.client.db.checkIsBlock(interaction.user.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${interaction.user.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(interaction, this.container.client, interaction.user.id, interaction.user.tag);
			}
			const t = await fetchT(interaction);
			const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, coolDown.inventory.sell, t);
			if (checkCoolDown) {
				return await interaction.reply(checkCoolDown);
			}

			switch (interaction.options.getSubcommand()) {
				case 'fish':
					if (interaction.options.getString('amountfish') !== 'all' && isNaN(interaction.options.getString('amountfish'))) {
						return send(
							message,
							t('commands/sell:fisherrorinput', {
								user: message.author.tag,
								prefix: await this.container.client.fetchPrefix(message)
							})
						);
					}
					return await this.sellFish(
						interaction,
						t,
						interaction.user.id,
						interaction.user.tag,
						interaction.options.getString('namefish'),
						interaction.options.getString('amountfish')
					);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('sell sell sell')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('fish')
				.setDescription('sell fish')
				.addStringOption((options) => options.setName('amountfish').setDescription('Enter amount or enter all').setRequired(true))
				.addStringOption((option) => option.setName('namefish').setDescription('Enter name of the fish'))
		),
	UserCommand
};
