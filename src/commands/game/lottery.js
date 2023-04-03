const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const emoji = require('../../config/emoji');
const game = require('../../config/game');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { logger } = require('../../utils/index');
const reminderCaptcha = require('../../utils/humanVerify/reminderCaptcha');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'lottery',
			aliases: ['lottery'],
			description: 'commands/lottery:description',
			usage: 'commands/lottery:usage',
			example: 'commands/lottery:example',
			cooldownDelay: 30000
		});
	}

	async messageRun(message, args) {
		let isBlock = await this.container.client.db.checkIsBlock(message.author.id);
		if (isBlock === true) return;
		if (this.container.client.options.spams.get(`${message.author.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
			return await reminderCaptcha(message, this.container.client, message.author.id, message.author.tag);
		}
		try {
			/*
			const t = await fetchT(message);

			let input = await args.next();

			let typeDigit;
			let code;
			if (input !== null) {
				if (typeof input === 'string' || input instanceof String) {
					if (input === 'results') {
						return this.embedResultLottery(message, t);
					} else if (input === 'list') {
						return this.embedListLottery(message, t, message.author.id);
					} else if (input === '2d' || input === '3d' || input === '4d' || input === '5d') {
						typeDigit = parseInt(input.charAt(0));
					} else if (!isNaN(Number(input))) {
						code = Number(input);
					}
				} else {
					//input error
					return send(
						message,
						t('commands/lottery:inputerror', {
							user: message.author.tag,
							prefix: await this.container.client.fetchPrefix(message)
						})
					);
				}
			}
			let userInfo = await this.container.client.db.fetchUser(message.author.id);
			return await this.mainProcess(typeDigit, code, t, message, message.author.tag, userInfo);
			*/
		} catch (error) {
			logger.error(error);
			console.log(error);
		}
	}

	async mainProcess(typeDigit, code, t, message, tag, userInfo) {
		if (userInfo.money - game.lottery.buy < 0) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/lottery:nomoney', {
					user: tag
				})
			);
		}
		const mapLength = new Map();
		mapLength.set(2, 100);
		mapLength.set(3, 900);
		mapLength.set(4, 9000);
		mapLength.set(5, 90000);
		//case 1 : find code
		if (code !== null && code !== undefined) {
			for (let i = 0; i < this.container.client.options.lottery.length; i++) {
				if (this.container.client.options.lottery[i].length === mapLength.get(code.toString().length === 1 ? 2 : code.toString().length)) {
					let location = this.container.client.options.lottery[i].indexOf(code);
					if (location === -1) {
						//exist
						return await utils.returnSlashAndMessage(
							message,
							t('commands/lottery:exist', {
								code: code,
								tag: tag
							})
						);
					} else {
						//ok
						if (message.type === 'APPLICATION_COMMAND') {
							await message.reply(t('commands/lottery:description'));
						}
						return await this.embedConfirm(code, t, message, tag, userInfo.discordId, null, location, i);
					}
				}
			}
		}
		//case 2 : find by typedigit
		else if (typeDigit) {
			const lotteryResult = await this.container.client.db.getLotteryResultByType(typeDigit);
			let count = lotteryResult.counter;
			if (count === mapLength.get(typeDigit) - 1) {
				// sold out this type
				return await utils.returnSlashAndMessage(
					message,
					t('commands/lottery:sold', {
						type: typeDigit + 'd',
						tag: tag
					})
				);
			}
			let codeByType;
			for (let i = 0; i < this.container.client.options.lottery.length; i++) {
				if (this.container.client.options.lottery[i].length === mapLength.get(typeDigit)) {
					while (this.container.client.options.lottery[i][count] === -1) {
						count++;
					}
					codeByType = this.container.client.options.lottery[i][count];
					//ok
					if (message.type === 'APPLICATION_COMMAND') {
						await message.reply(t('commands/lottery:description'));
					}
					return await this.embedConfirm(codeByType, t, message, tag, userInfo.discordId, lotteryResult, count, i);
				}
			}
		}
		//case 3: random
		else {
			for (let typeJ = 5; typeJ > 1; typeJ--) {
				const lotteryResult = await this.container.client.db.getLotteryResultByType(typeJ);
				let count = lotteryResult.counter;
				if (count === mapLength.get(typeJ) - 1) {
					continue;
				}
				let codeByType;
				for (let i = 0; i < this.container.client.options.lottery.length; i++) {
					if (this.container.client.options.lottery[i].length === mapLength.get(typeJ)) {
						while (this.container.client.options.lottery[i][count] === -1) {
							count++;
						}
						codeByType = this.container.client.options.lottery[i][count];
						//ok
						if (message.type === 'APPLICATION_COMMAND') {
							await message.reply(t('commands/lottery:description'));
						}
						return await this.embedConfirm(codeByType, t, message, tag, userInfo.discordId, lotteryResult, count, i);
					}
				}
			}
			// sold out all
			return await utils.returnSlashAndMessage(
				message,
				t('commands/lottery:soldout', {
					tag: tag
				})
			);
		}
	}

	async embedConfirm(code, t, message, tag, userId, lotteryResult, count, index) {
		const moneyEmoji = emoji.common.money;
		const blank = emoji.common.blank;
		let embedMSG = new MessageEmbed().setTitle(t('commands/lottery:title', { tag: tag })).addField(
			`${blank}`,
			t('commands/lottery:content', {
				code: code,
				type: code.toString().length === 1 ? 2 : code.toString().length + 'd',
				price: game.lottery.buy,
				emoji: moneyEmoji
			})
		);
		const row = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('accept').setLabel(t('commands/lottery:accept')).setStyle('SUCCESS'),
			new MessageButton().setCustomId('cancel').setLabel(t('commands/lottery:cancel')).setStyle('DANGER')
		);
		let newMsg = await send(message, { embeds: [embedMSG], components: [row] });
		const filter = (message) => {
			return ['accept', 'cancel'].includes(message.customId) && message.user.id === userId;
		};
		const collector = newMsg.createMessageComponentCollector({ filter, time: 8000 });
		collector.on('collect', async (message) => {
			if (message.customId === 'accept') {
				//try catch if duplicate lottery
				try {
					await this.container.client.db.createNewLottery(userId, code);
				} catch (error) {
					logger.error(error);
					console.log(error);
					embedMSG.setColor(0xff0000);
					embedMSG.setFooter({ text: t('commands/lottery:error') });
					await newMsg.edit({ embeds: [embedMSG], components: [] });
					collector.stop('done');
					return;
				}
				this.container.client.options.lottery[index][count] = -1;
				if (lotteryResult) {
					await this.container.client.db.updateCountLotteryResult(lotteryResult._id, count);
				}
				await this.container.client.db.updateUser(userId, {
					$inc: {
						money: -game.lottery.buy
					}
				});
				// row.components.forEach((e) => {
				// 	e.setDisabled(true);
				// });
				embedMSG.setColor(0x78be5a);
				embedMSG.setFooter({ text: t('commands/lottery:acceptbuy') });
				await newMsg.edit({ embeds: [embedMSG], components: [] });
				collector.stop('done');
				return;
			} else if (message.customId === 'cancel') {
				// row.components.forEach((e) => {
				// 	e.setDisabled(true);
				// });
				embedMSG.setColor(0xffd700);
				embedMSG.setFooter({ text: t('commands/lottery:cancelbuy') });
				await newMsg.edit({ embeds: [embedMSG], components: [] });
				collector.stop('done');
				return;
			}
		});
		collector.on('end', async (collected, reason) => {
			if (reason == 'time') {
				embedMSG.setColor(0xffd700);
				embedMSG.setFooter({ text: t('commands/lottery:notactive') });
				row.components.forEach((e) => {
					e.setDisabled(true);
				});
				await newMsg.edit({ embeds: [embedMSG], components: [row] });
				return;
			}
		});
		return;
	}

	async embedResultLottery(message, t) {
		let mappingPrize = new Map();
		mappingPrize.set(0, {
			text: t('commands/lottery:text0'),
			money: game.lottery.special
		});
		mappingPrize.set(1, {
			text: t('commands/lottery:text1'),
			money: game.lottery.fisrt
		});
		mappingPrize.set(2, {
			text: t('commands/lottery:text2'),
			money: game.lottery.second
		});
		mappingPrize.set(3, {
			text: t('commands/lottery:text3'),
			money: game.lottery.third
		});
		mappingPrize.set(4, {
			text: t('commands/lottery:text4'),
			money: game.lottery.fourth
		});
		mappingPrize.set(5, {
			text: t('commands/lottery:text5'),
			money: game.lottery.fifth
		});
		mappingPrize.set(6, {
			text: t('commands/lottery:text6'),
			money: game.lottery.sixth
		});
		mappingPrize.set(7, {
			text: t('commands/lottery:text7'),
			money: game.lottery.seventh
		});

		const result = await this.container.client.db.getLastResultLottery();
		let monthEmbedResult = Number(result[0].updatedAt.getMonth()) + 1;
		let dateEmbedResult = result[0].updatedAt.getDate();
		let msgEmbed = new MessageEmbed().setTitle(
			t('commands/lottery:titleResult', {
				date:
					result[0].updatedAt.getFullYear() +
					'/' +
					(monthEmbedResult.toString().length < 2 ? '0' + monthEmbedResult : monthEmbedResult) +
					'/' +
					(dateEmbedResult.toString().length < 2 ? '0' + dateEmbedResult : dateEmbedResult)
			})
		);
		for (let i = 0; i < result.length; i++) {
			let listCode = '';
			let checkChange = result[i].arrayResult[0].prize;
			for (let j = 0; j < result[i].arrayResult.length; j++) {
				if (checkChange !== result[i].arrayResult[j].prize) {
					msgEmbed.addField(
						mappingPrize.get(checkChange).text + ` - ${mappingPrize.get(checkChange).money} ${emoji.common.money}`,
						`*\`${listCode}\`*`
					);
					listCode = '';
				} else if (listCode.length > 0) {
					listCode += ' - ';
				}
				checkChange = result[i].arrayResult[j].prize;
				listCode += result[i].arrayResult[j].code;
				if (j === result[i].arrayResult.length - 1) {
					msgEmbed.addField(
						mappingPrize.get(checkChange).text + ` - ${mappingPrize.get(checkChange).money} ${emoji.common.money}`,
						`*\`${listCode}\`*`
					);
					break;
				}
			}
		}
		return await utils.returnSlashAndMessage(message, { embeds: [msgEmbed] });
	}

	async embedListLottery(message, t, discordId) {
		const result = await this.container.client.db.findAllLotteryByDiscordId(discordId);
		if (result.length < 1) {
			return await utils.returnSlashAndMessage(message, 'No lottery');
		}
		let monthEmbedResult = Number(result[0].createdAt.getMonth()) + 1;
		let dateEmbedResult = result[0].createdAt.getDate();
		let msgEmbed = new MessageEmbed().setTitle(
			t('commands/lottery:titleList', {
				date:
					result[0].createdAt.getFullYear() +
					'/' +
					(monthEmbedResult.toString().length < 2 ? '0' + monthEmbedResult : monthEmbedResult) +
					'/' +
					(dateEmbedResult.toString().length < 2 ? '0' + dateEmbedResult : dateEmbedResult)
			})
		);
		for (const element of result) {
			msgEmbed.addField(
				`${element.createdAt.getHours().toString().length < 2 ? '0' + element.createdAt.getHours() : element.createdAt.getHours()}:${
					element.createdAt.getMinutes().toString().length < 2 ? '0' + element.createdAt.getMinutes() : element.createdAt.getMinutes()
				}:${element.createdAt.getSeconds().toString().length < 2 ? '0' + element.createdAt.getSeconds() : element.createdAt.getSeconds()}`,
				`Code: ${element.code}`
			);
		}
		return await utils.returnSlashAndMessage(message, { embeds: [msgEmbed] });
	}

	async execute(interaction) {
		let isBlock = await this.container.client.db.checkIsBlock(interaction.user.id);
		if (isBlock === true) return;
		if (this.container.client.options.spams.get(`${interaction.user.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
			return await reminderCaptcha(interaction, this.container.client, interaction.user.id, interaction.user.tag);
		}
		try {
			/*
			const t = await fetchT(interaction);
			if (interaction.options.getSubcommand() === 'results') {
				return this.embedResultLottery(interaction, t);
			} else if (interaction.options.getSubcommand() === 'list') {
				return this.embedListLottery(interaction, t, interaction.user.id);
			}
			//no cooldown :3
			let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
			return await this.mainProcess(
				interaction.options.getInteger('type'),
				interaction.options.getInteger('code'),
				t,
				interaction,
				interaction.user.tag,
				userInfo
			);
			*/
		} catch (error) {
			logger.error(error);
			console.log(error);
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lottery')
		.setDescription('lottery for lucky')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('buy')
				.setDescription('Buy lottery tickets')
				.addIntegerOption((option) =>
					option
						.setName('type')
						.setDescription('Enter an integer that is the length of the lottery code')
						.setRequired(false)
						.addChoices(
							{ name: 'two-digit type', value: 2 },
							{ name: 'three-digit type', value: 3 },
							{ name: 'four-digit type', value: 4 },
							{ name: 'five-digit type', value: 5 }
						)
				)
				.addIntegerOption((option) =>
					option.setName('code').setDescription('Enter the integer that is the lottery number you want').setRequired(false)
				)
		)
		.addSubcommand((subcommand) => subcommand.setName('list').setDescription('See the list of lottery purchased'))
		.addSubcommand((subcommand) => subcommand.setName('results').setDescription('View lottery results')),
	UserCommand
};
