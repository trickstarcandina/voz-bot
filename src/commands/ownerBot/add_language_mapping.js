const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const { logger } = require('../../utils/index');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'add_language_mapping',
			description: 'add language mapping',
			usage: 'wadd_language_mapping <lang> <type> <key> <value>',
			example: 'wadd_language_mapping VN listname frog ếch'
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		try {
			if (process.env.OWNER_IDS.split(',').includes(message.author.id)) {
				if (args.parser.parserOutput.ordered.length < 4) {
					return message.channel.send('Error input');
				}
				const input = [];
				let description = '';
				for (let i = 0; i < args.parser.parserOutput.ordered.length; i++) {
					if (i < 3) {
						input.push(args.parser.parserOutput.ordered[i].value);
					} else {
						description += args.parser.parserOutput.ordered[i].value + ' ';
					}
				}
				input.push(description);
				await this.container.client.db.addNewLanguageMapping(input[0], input[1], input[2], input[3]);
				logger.warn(
					`User ${message.author.id} add language mapping ... lang: ${input[0]} - type: ${input[1]} - key: ${input[2]} - value: ${input[3]}`
				);
				return message.channel.send(
					`Success add new language mapping ... lang: ${input[0]} - type: ${input[1]} - key: ${input[2]} - value: ${input[3]}`
				);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
