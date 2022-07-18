const WynnCommand = require('../../lib/Structures/WynnCommand');
const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const { logger } = require('../../utils/index');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'add_fish',
			description: 'add new fish',
			usage: 'wadd_fish <id> <name> <rarity> <emoji> <description>',
			example: 'wadd_fish 100 frog normal 🐸 ếch'
		});
	}

	async messageRun(message, args) {
		const t = await fetchT(message);
		try {
			if (process.env.OWNER_IDS.split(',').includes(message.author.id)) {
				if (args.parser.parserOutput.ordered.length < 5) {
					return message.channel.send('Error input');
				}
				const input = [];
				let description = '';
				for (let i = 0; i < args.parser.parserOutput.ordered.length; i++) {
					if (i === 0) {
						input.push(parseInt(args.parser.parserOutput.ordered[i].value));
					} else if (i < 4) {
						input.push(args.parser.parserOutput.ordered[i].value);
					} else {
						description += args.parser.parserOutput.ordered[i].value + ' ';
					}
				}
				input.push(description);
				if (isNaN(input[0])) {
					return message.channel.send('Error input');
				}
				await this.container.client.db.addNewFish(input[0], input[1], input[2], input[3], input[4]);
				logger.warn(
					`User ${message.author.id} add new fish ... id: ${input[0]} - name: ${input[1]} - rarity: ${input[2]} - emoji: ${input[3]} - description: ${input[4]}`
				);
				return message.channel.send(
					`Success add new fish ... id: ${input[0]} - name: ${input[1]} - rarity: ${input[2]} - emoji: ${input[3]} - description: ${input[4]}`
				);
			}
		} catch (err) {
			logger.error(err);
			return await send(message, t('other:error', { supportServer: process.env.SUPPORT_SERVER_LINK }));
		}
	}
}

exports.UserCommand = UserCommand;
