const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const { logger } = require('../../utils/index');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'add_rate_config',
			description: 'add rate config. config rate number after config list fish',
			usage: 'wadd_rate_config <location> <name fish 1> <name fish 2> <name fish ...> | wadd_rate_config -r <location> <rate normal> <rate rare> ... <rate lengend>',
			example: 'wadd_rate_config sea squid starfish'
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		try {
			if (process.env.OWNER_IDS.split(',').includes(message.author.id)) {
				let arrayFish = [];
				let location = await args.next();
				if (location === '-r') {
					let locationReal = await args.next();
					let normal = await args.next(),
						rare = await args.next(),
						superRate = await args.next(),
						ultra = await args.next(),
						ultimate = await args.next(),
						legend = await args.next();
					await this.container.client.db.updateRateConfig(locationReal, {
						normal: normal,
						rare: rare,
						super: superRate,
						ultra: ultra,
						ultimate: ultimate,
						legend: legend
					});
					logger.warn(
						`User ${message.author.id} config rate fish in ${locationReal} rate ${normal} - ${rare} - ${superRate} - ${ultra} - ${ultimate}- ${legend}`
					);
					return message.channel.send(
						`Success config rate fish in ${locationReal} rate ${normal} - ${rare} - ${superRate} - ${ultra} - ${ultimate}- ${legend}`
					);
				}
				for (let i = 1; i < args.parser.parserOutput.ordered.length; i++) {
					let fishInfoDB = await this.container.client.db.getFishByName(args.parser.parserOutput.ordered[i].value);
					let newinfo = {};
					newinfo.id = fishInfoDB.id;
					newinfo.name = fishInfoDB.name;
					newinfo.rarity = fishInfoDB.rarity;
					newinfo.emoji = fishInfoDB.emoji;
					newinfo.description = fishInfoDB.description;
					arrayFish.push(newinfo);
				}
				await this.container.client.db.addNewRateConfig(location, arrayFish);
				logger.warn(`User ${message.author.id} config rate fish in ${location}`);
				return message.channel.send(`Success config rate fish in ${location}`);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
