const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');
const coolDown = require('../../config/cooldown');
const configSell = require('../../config/sell');
const { MessageEmbed } = require('discord.js');
const reminderCaptcha = require('../../utils/humanVerify/reminderCaptcha');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'species',
			aliases: ['species', 'spec'],
			description: 'commands/species:description',
			usage: 'commands/species:usage',
			example: 'commands/species:example'
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		try {
			let isBlock = await this.container.client.db.checkIsBlock(message.author.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${message.author.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(message, this.container.client, message.author.id, message.author.tag);
			}
			let input = await args.rest('string').catch(() => null);
			if (input === null) {
				return;
			}
			const checkCoolDown = await this.container.client.checkTimeCoolDownWithCheckSpam(
				message.author.id,
				this.name,
				coolDown.collect.species,
				t
			);
			if (checkCoolDown) {
				if (checkCoolDown.image !== undefined) {
					return await utils.sendCaptchaImage(
						message.author.id,
						this.container.client,
						checkCoolDown.image,
						checkCoolDown.text,
						message,
						t('commands/captcha:require', {
							user: message.author.tag
						})
					);
				}
				return send(message, checkCoolDown);
			}
			return await this.mainProcess(message, t, input);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async mainProcess(message, t, input) {
		const inputPreParse = input.toLowerCase().replace('con ', '').replace('con', '');
		if (this.container.client.options.fish.get('listname').includes(inputPreParse)) {
			return await this.getInfoFish(message, t, inputPreParse, inputPreParse);
		} else if (this.container.client.options.fish.get('listnameVN').includes(inputPreParse)) {
			return await this.getInfoFish(
				message,
				t,
				utils.getKeyByValueMap(this.container.client.options.fish.get('vi-VN').get('namefish'), inputPreParse),
				inputPreParse
			);
		} else if (input.toLowerCase() === 'listfish') {
			const infoFish = [...this.container.client.options.fish.get('listinfo').values()];
			let result = '';
			infoFish.sort(function (a, b) {
				if (a.id < b.id) return -1;
				if (a.id > b.id) return 1;
			});
			for (let i = 0; i < infoFish.length; i++) {
				result += '`' + infoFish[i].id.toString() + '`' + '....' + infoFish[i].emoji + ' ' + infoFish[i].name + '\n';
			}
			let embedMSG = new MessageEmbed().setDescription(t(`commands/species:seedetails`) + ': `vspec {name}`').addField('ID___Name', result);
			return await utils.returnSlashAndMessage(message, { embeds: [embedMSG] });
		} else {
			return await utils.returnSlashAndMessage(
				message,
				t(`commands/species:nospecies`, {
					input: input.toLowerCase()
				})
			);
		}
	}

	async getInfoFish(message, t, name, nameLanguage) {
		const infoFish = this.container.client.options.fish.get('listinfo').get(name);
		let emoji = infoFish.emoji;
		let temp;
		if ((temp = emoji.match(/:[0-9]+>/))) {
			temp = 'https://cdn.discordapp.com/emojis/' + temp[0].match(/[0-9]+/)[0] + '.';
			if (emoji.match(/<a:/)) temp += 'gif';
			else temp += 'png';
			emoji = temp;
		} else {
			emoji = undefined;
		}
		let map = new Map();
		configSell.fishing.forEach((object) => {
			map.set(object.name, object.price);
		});
		let embedMSG = new MessageEmbed()
			.setTitle(`${infoFish.emoji} ${nameLanguage}`)
			.setDescription('`' + infoFish.description + '`')
			.setThumbnail(emoji)
			.addFields(
				{
					name: t(`commands/species:name`),
					value: '`' + nameLanguage + '`'
				},
				{ name: t(`commands/species:rarity`), value: '`' + t(`commands/fishing:${infoFish.rarity}`) + '`' },
				{
					name: t(`commands/species:price`),
					value:
						'`' +
						(map.has(infoFish.name) === true
							? map.get(infoFish.name).toString()
							: map.has(infoFish.rarity) === true
							? map.get(infoFish.rarity).toString()
							: '???') +
						'`'
				}
			);
		return await utils.returnSlashAndMessage(message, { embeds: [embedMSG] });
	}

	async execute(interaction) {
		try {
			let isBlock = await this.container.client.db.checkIsBlock(interaction.user.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${interaction.user.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(interaction, this.container.client, interaction.user.id, interaction.user.tag);
			}
			const t = await fetchT(interaction);
			const checkCoolDown = await this.container.client.checkTimeCoolDown(interaction.user.id, this.name, coolDown.collect.species, t);
			if (checkCoolDown) {
				return await interaction.reply(checkCoolDown);
			}
			return await this.mainProcess(interaction, t, interaction.options.getString('name'));
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('species')
		.setDescription('view species')
		.addStringOption((option) => option.setName('name').setDescription('Enter name to view species').setRequired(true)),
	UserCommand
};
