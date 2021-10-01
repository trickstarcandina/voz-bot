const { send } = require('@sapphire/plugin-editable-commands');
const { fetchT } = require('@sapphire/plugin-i18next');
const { MessageEmbed } = require('discord.js');
const WynnCommand = require('../../lib/Structures/WynnCommand');

class UserCommand extends WynnCommand {
	constructor(context, options) {
		super(context, {
			...options,
			name: 'help',
			aliases: ['help', 'h', 'common'],
			description: 'commands/help:description',
			usage: 'commands/help:usage',
			example: 'commands/help:example'
		});
	}
	async run(message, args) {
		const t = await fetchT(message);

		const commandName = await args.pick('string').catch(() => null);

		if (commandName) {
			const command = await this.container.stores.get('commands').get(commandName);
			console.log(command);
			const msg = await this.buildCommandEmbed(t, message, command);
			return send(message, { embeds: [msg] });
		}

		return send(message, { embeds: [await this.buildHelp(t, message)] });
	}

	async buildCommandEmbed(t, message, command) {
		const prefix = await this.container.client.fetchPrefix(message);
		return new MessageEmbed().setTitle(await t('commands/help:title', { cN: command.name })).addFields(
			{ name: `__${await t('commands/help:descriptionTitle')}__`, value: `\`\`\`${await t(command.description)}\`\`\`` },
			{ name: `__${t('commands/help:category')}__`, value: `\`\`\`${command.category.toUpperCase()}\`\`\``, inline: true },
			{ name: `__${t('commands/help:aliases')}__`, value: `\`\`\`${command.aliases.join(', ')}\`\`\``, inline: true },
			{ name: `__${t('commands/help:cooldown')}__`, value: `\`\`\`${command.cooldownDelay || 0}ms\`\`\``, inline: true },
			{
				name: `__${t('commands/help:usageTitle')}__`,
				value: `\`\`\`${t(command.usage, { prefix: prefix })}\`\`\``,
				inline: false
			},
			{
				name: `__${t('commands/help:exampleTitle')}__`,
				value: `\`\`\`${await t(command.example, {
					prefix: prefix,
					returnObjects: true,
					joinArrays: ', '
				})}\`\`\``,
				inline: false
			}
		);
	}

	async buildHelp(t, message) {
		const prefix = await this.container.client.fetchPrefix(message);
		const categories = this.container.stores.get('commands').categories;

		const commandGroups = [];

		categories.forEach((category) => {
			let commands = this.container.stores
				.get('commands')
				.filter((command) => command.category === category)
				.toJSON();

			commands = Object.assign(commands).map((item) => item.name);
			commandGroups.push({
				category: category,
				commands: commands
			});
		});

		const fields = commandGroups.map((item) => ({
			name: `**${item.category.charAt(0).toUpperCase() + item.category.slice(1)}**`,
			value: item.commands.map((item) => `\`${item}\``).join(', ')
		}));

		const color = message.member.displayColor;
		return new MessageEmbed()
			.setTitle(t('commands/help:buildTitle'))
			.setDescription(`\`\`\`${t('commands/help:buildDescription', { prefix })}\`\`\``)
			.setColor(color)
			.addFields(fields)
			.setThumbnail(this.container.client.user.displayAvatarURL())
			.setFooter(t('commands/help:footer'));
	}
}

exports.UserCommand = UserCommand;