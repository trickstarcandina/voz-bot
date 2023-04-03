const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const WynnCommand = require('../../lib/Structures/WynnCommand');
const emoji = require('../../config/emoji');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const { logger } = require('../../utils/index');
const blank = emoji.common.blank;
const { MessageEmbed } = require('discord.js');

const reminderCaptcha = require('../../utils/humanVerify/reminderCaptcha');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'lucky',
			aliases: ['lucky'],
			description: 'commands/lucky:description',
			usage: 'commands/lucky:usage',
			example: 'commands/lucky:example',
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
			let input1 = await args.next();
			if (input1 === 'results') {
				return this.embedResultLucky(message, t);
			} else if (input1 === 'list') {
				return this.embedListLucky(message, t, message.author.id);
			}
			let input2 = await args.next();
			let userInfo = await this.container.client.db.fetchUser(message.author.id);
			let betMoney = input1 === 'all' ? userInfo.money : Number(input1);
			return await this.mainProcess(betMoney, input2, t, message, message.author.tag, userInfo);
			*/
		} catch (err) {
			logger.error(err);
			console.log(err);
		}
	}

	async mainProcess(betMoney, input2, t, message, tag, userInfo) {
		if (userInfo.money - betMoney < 0) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/lucky:nomoney', {
					user: tag
				})
			);
		}
		const regex = new RegExp('^([0-9]{2}-+)+$');
		if (!regex.test(input2 + '-') || isNaN(betMoney) || betMoney < 1) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/lucky:inputerror', {
					user: tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		let arrayBet = input2
			.split('-')
			.filter((n) => n)
			.map(Number);
		await Promise.all([
			this.container.client.db.addNewBetLucky(userInfo.discordId, betMoney, arrayBet),
			this.container.client.db.updateUser(userInfo.discordId, {
				$inc: {
					money: -betMoney
				}
			})
		]);
		return await utils.returnSlashAndMessage(
			message,
			t('commands/lucky:result', {
				user: tag,
				arrayBet: arrayBet,
				betMoney: betMoney,
				emoji: emoji.common.money
			})
		);
	}

	async embedResultLucky(message, t) {
		const result = await this.container.client.db.getLastResultLottery();
		let monthEmbedResult = Number(result[0].updatedAt.getMonth()) + 1;
		let dateEmbedResult = result[0].updatedAt.getDate();
		let listCode = new Array();
		for (let i = 0; i < result.length; i++) {
			for (let j = 0; j < result[i].arrayResult.length; j++) {
				listCode.push(result[i].arrayResult[j].code % 100);
			}
		}
		let msgEmbed = new MessageEmbed().setTitle(
			t('commands/lucky:titleResult', {
				date:
					result[0].updatedAt.getFullYear() +
					'/' +
					(monthEmbedResult.toString().length < 2 ? '0' + monthEmbedResult : monthEmbedResult) +
					'/' +
					(dateEmbedResult.toString().length < 2 ? '0' + dateEmbedResult : dateEmbedResult)
			})
		);
		msgEmbed.addField(
			`${blank}`,
			`*\`${listCode.sort(function (a, b) {
				return a - b;
			})}\`*`
		);
		return await utils.returnSlashAndMessage(message, { embeds: [msgEmbed] });
	}

	async embedListLucky(message, t, discordId) {
		const result = await this.container.client.db.findAllLuckyByDiscordId(discordId);
		if (result.length < 1) {
			return await utils.returnSlashAndMessage(message, t('commands/lucky:noluckybet'));
		}
		let monthEmbedResult = Number(result[0].createdAt.getMonth()) + 1;
		let dateEmbedResult = result[0].createdAt.getDate();
		let msgEmbed = new MessageEmbed().setTitle(
			t('commands/lucky:titleList', {
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
				`Code: ${element.arrayBet} - ${element.moneyBet} ${emoji.common.money}`
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
				return this.embedResultLucky(interaction, t);
			} else if (interaction.options.getSubcommand() === 'list') {
				return this.embedListLucky(interaction, t, interaction.user.id);
			}
			//no cooldown :3
			let userInfo = await this.container.client.db.fetchUser(interaction.user.id);
			return await this.mainProcess(
				interaction.options.getInteger('betmoney'),
				interaction.options.getString('numbersequence'),
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
		.setName('lucky')
		.setDescription('Test your luck by guessing the sequence of numbers')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('bet')
				.setDescription('bet money on numbers')
				.addIntegerOption((option) => option.setName('betmoney').setDescription('Enter an integer that is bet money').setRequired(true))
				.addStringOption((option) =>
					option.setName('numbersequence').setDescription('Enter the integer that is the number sequence you want').setRequired(true)
				)
		)
		.addSubcommand((subcommand) => subcommand.setName('list').setDescription('See the list of lucky purchased'))
		.addSubcommand((subcommand) => subcommand.setName('results').setDescription('View number sequence results')),
	UserCommand
};
