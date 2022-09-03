const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const utils = require('../../lib/utils');

const reminderCaptcha = require('../../utils/humanVerify/reminderCaptcha');
const coolDown = require('../../config/cooldown');
const collect = require('../../config/collect');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'fishing',
			aliases: ['fishing', 'f'],
			description: 'commands/fishing:description',
			usage: 'commands/fishing:usage',
			example: 'commands/fishing:example'
		});
	}

	async messageRun(message, args) {
		try {
			let isBlock = await this.container.client.db.checkIsBlock(message.author.id);
			if (isBlock === true) return;
			if (this.container.client.options.spams.get(`${message.author.id}`) === 'warn' || (isBlock.length > 0 && !isBlock[0].isResolve)) {
				return await reminderCaptcha(message, this.container.client, message.author.id, message.author.tag);
			}
			const t = await fetchT(message);
			const checkCoolDown = await this.container.client.checkTimeCoolDownWithCheckSpam(message.author.id, this.name, coolDown.collect.sea, t);
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
			let input1 = await args.next();
			if (input1 === 'config') {
				let input2 = await args.next();
				if (['tub', 'lake', 'river', 'sea'].includes(input2)) {
					return await Promise.all([
						this.container.client.resetCustomCooldown(message.author.id, this.name),
						this.configLocation(message, t, message.author.id, input2, message.author.tag)
					]);
				}
				// sai type return ...;
			}
			return await this.mainProcess(message, t, message.author.id, message.author.tag);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}

	async mainProcess(message, t, userId, tag) {
		const itemFish = await this.container.client.db.getItemFishByDiscordId(userId);
		if (itemFish.bait < 1) {
			return await utils.returnSlashAndMessage(
				message,
				t('commands/fishing:nobait', {
					user: tag,
					prefix: await this.container.client.fetchPrefix(message)
				})
			);
		}
		//random and get result
		let random = Math.random();
		let resultFishing = 'fail';
		let arrayFish = this.container.client.options.fish.get(itemFish.location).fish;

		for (let [key, value] of this.container.client.options.fish.get(itemFish.location).rate) {
			if (random <= value) {
				resultFishing = utils.pickRandom(arrayFish.filter((e) => e.rarity === key));
				break;
			}
		}

		if (resultFishing === 'fail') {
			await this.container.client.db.updateItemFish(userId, {
				$inc: {
					bait: -1
				}
			});
			return await utils.returnSlashAndMessage(
				message,
				t('commands/fishing:fishingfail', {
					user: tag
				})
			);
		}
		//reset cool down real
		//set to cache client
		/*
			REFACTOR THIS
		*/
		if (collect.fishing.increaseturn.includes(resultFishing)) {
			await this.container.client.setCustomCooldown(userId, this.name, 0);
		} else if (itemFish.location !== 'sea') {
			let coolDownReal = new Map();
			coolDownReal.set('tub', coolDown.collect.tub);
			coolDownReal.set('lake', coolDown.collect.lake);
			coolDownReal.set('river', coolDown.collect.river);
			await this.container.client.setCustomCooldown(userId, this.name, coolDownReal.get(itemFish.location));
		}

		let newArray = itemFish.arrayFish.slice();
		let flag = 0;
		for (let i = 0; i < newArray.length; i++) {
			if (newArray[i].id === resultFishing.id) {
				newArray[i].amount += 1;
				flag = 1;
				break;
			}
		}
		if (flag === 0) {
			newArray.push({
				id: resultFishing.id,
				name: resultFishing.name,
				emoji: resultFishing.emoji,
				amount: 1
			});
		}

		await this.container.client.db.updateItemFish(userId, {
			$inc: {
				bait: -1
			},
			arrayFish: newArray
		});
		let nameFishForLang = resultFishing.name;
		const currentLanguage = await this.container.i18n.fetchLanguage(message);
		if (currentLanguage !== 'en-US' && this.container.client.options.fish.get('vi-VN') !== undefined) {
			// switch case if amout lang > 2
			nameFishForLang = this.container.client.options.fish.get('vi-VN').get('namefish').get(resultFishing.name);
		}

		return await utils.returnSlashAndMessage(
			message,
			t('commands/fishing:fishingdone', {
				user: tag,
				name: nameFishForLang,
				emoji: resultFishing.emoji,
				rarity: t(`commands/fishing:${resultFishing.rarity}`)
			})
		);
	}

	async configLocation(message, t, userId, type, tag) {
		await this.container.client.db.updateItemFish(userId, {
			location: type
		});
		return await utils.returnSlashAndMessage(
			message,
			t('commands/fishing:config', {
				user: tag,
				location: t(`commands/fishing:${type}`)
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
			const checkCoolDown = await this.container.client.checkTimeCoolDownWithCheckSpam(
				interaction.user.id,
				this.name,
				coolDown.collect.fishing,
				t
			);
			if (checkCoolDown) {
				if (checkCoolDown.image !== undefined) {
					return await utils.sendCaptchaImage(
						interaction.user.id,
						this.container.client,
						checkCoolDown.image,
						checkCoolDown.text,
						interaction,
						t('commands/captcha:require', {
							user: interaction.user.tag
						})
					);
				}
				return await interaction.reply(checkCoolDown);
			}
			if (interaction.options.getSubcommand() === 'config') {
				return await this.configLocation(
					interaction,
					t,
					interaction.user.id,
					interaction.options.getString('location'),
					interaction.user.tag
				);
			}
			return await this.mainProcess(interaction, t, interaction.user.id, interaction.user.tag);
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fishing')
		.setDescription('Fishing, fishing, fishing ...')
		.addSubcommand((subcommand) => subcommand.setName('now').setDescription('go to fishing now'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('config')
				.setDescription('config location')
				.addStringOption((option) =>
					option
						.setName('location')
						.setDescription('Enter location to fishing')
						.setRequired(true)
						.addChoices(
							{ name: 'tub', value: 'tub' },
							{ name: 'lake', value: 'lake' },
							{ name: 'river', value: 'river' },
							{ name: 'sea', value: 'sea' }
						)
				)
		),
	UserCommand
};
