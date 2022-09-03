const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const { logger } = require('../../utils/index');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'reload_cache_config_rate',
			description: 'reload cache config rate',
			usage: 'wreload_cache_config_rate',
			example: 'wreload_cache_config_rate'
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		try {
			if (process.env.OWNER_IDS.split(',').includes(message.author.id)) {
				await Promise.all([this.container.client.loadFishRateAndInfo(), this.container.client.loadLanguageMappingVN()]);
				logger.warn(`User ${message.author.id} reload cache config rate`);
				return message.channel.send(`Success reload cache config rate`);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
