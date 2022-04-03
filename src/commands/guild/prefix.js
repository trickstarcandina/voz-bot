const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const logger = require('../../utils/logger');
const { SlashCommandBuilder } = require('@discordjs/builders');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'prefix',
			description: 'commands/prefix:description',
			aliases: ['prefix'],
			usage: 'commands/prefix:usage',
			example: 'commands/prefix:example',
			preconditions: ['GuildOnly', ['AdminOnly']],
			cooldownDelay: 15000
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		const prefix = await args.pick('string').catch(() => null);

		const currentPrefix = await this.container.client.fetchPrefix(message);

		if (!prefix) {
			return send(message, t('commands/prefix:currentPrefix', { prefix: currentPrefix }));
		}

		try {
			const guildData = await this.container.client.db.updateGuild(message.guild.id, { prefix: prefix });

			if (guildData) {
				return send(message, t('commands/prefix:updatePrefix', { newPrefix: prefix }));
			}
		} catch (err) {
			logger.error(err);
			return send(message, t('commands/prefix:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder().setName('prefix').setDescription('commands/prefix:description'),
	UserCommand
};
