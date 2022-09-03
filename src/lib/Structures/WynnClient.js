const { SapphireClient } = require('@sapphire/framework');
const Discord = require('discord.js');

const {
	fetchPrefix,
	checkTimeCoolDown,
	checkTimeCoolDownWithCheckSpam,
	resetCooldown,
	setCustomCooldown,
	resetCustomCooldown,
	loadArrayLottery,
	setArrayLottery,
	loadFishRateAndInfo,
	loadLanguageMappingVN
} = require('./WynnClientFunction');

class WynnClient extends SapphireClient {
	constructor(options) {
		super({
			...options,
			i18n: {
				defaultMissingKey: 'missing',
				defaultNS: 'default',
				i18next: {
					preload: ['en-US', 'vi-VN'],
					load: 'currentOnly',
					lowerCaseLng: false,
					fallbackLng: 'en-US',
					initImmediate: false,
					interpolation: {
						escapeValue: false
					}
				},
				fetchLanguage: async ({ guild }) => {
					if (guild) {
						const guildConfig = await this.db.fetchGuild(guild.id);
						return guildConfig.language;
					}

					return 'en-US';
				}
			},
			timeouts: new Discord.Collection(),
			spamTime: new Discord.Collection(),
			spams: new Discord.Collection(),
			lottery: new Array(),
			fish: new Discord.Collection()
		});
		this.db = require('./../../database/mongodb');

		this.fetchPrefix = fetchPrefix.bind(this);
		//cooldown
		this.checkTimeCoolDown = checkTimeCoolDown.bind(this);
		this.checkTimeCoolDownWithCheckSpam = checkTimeCoolDownWithCheckSpam.bind(this);
		this.resetCooldown = resetCooldown.bind(this);
		this.resetCustomCooldown = resetCustomCooldown.bind(this);
		this.setCustomCooldown = setCustomCooldown.bind(this);
		//cache array lottery
		this.loadArrayLottery = loadArrayLottery.bind(this);
		this.setArrayLottery = setArrayLottery.bind(this);
		//cache list fish and rate fish
		this.loadFishRateAndInfo = loadFishRateAndInfo.bind(this);
		//cache language
		this.loadLanguageMappingVN = loadLanguageMappingVN.bind(this);
	}
}
module.exports = WynnClient;
