require('./lib/setup');
require('dotenv').config({ path: './src/.env' });
const { LogLevel, err } = require('@sapphire/framework'),
	mongoose = require('mongoose');
const WynnClient = require('./lib/Structures/WynnClient');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
let cronJob = require('./shedules/index');

const commands = [];
for (const folder of fs.readdirSync('./src/commands')) {
	if (folder.toString() === 'ownerBot') continue;
	const commandFiles = fs.readdirSync('./src/commands/' + folder.toString()).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`../src/commands/${folder.toString()}/${file}`);
		commands.push(command.data.toJSON());
	}
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const client = new WynnClient({
	defaultPrefix: process.env.PREFIX,
	regexPrefix: RegExp('(^(hey +)?bot[,! ])|(' + process.env.PREFIX.toString().toLocaleUpperCase() + ')'),
	//regexPrefix/i,
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultCooldown: {
		delay: 5000
	},
	logger: {
		level: LogLevel.Debug
	},
	partials: ['CHANNEL'],
	shards: 'auto',
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS'
	]
});

const main = async () => {
	try {
		await mongoose
			.connect(process.env.MONGO_DB, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			})
			.then(() => {
				client.logger.info('MongoDB connected');
			})
			.catch((err) => {
				client.logger.error(`Unable to connect MongoDB. Error: ${err}`);
			});

		client.logger.info('Logging in');
		await client.login(process.env.TOKEN);
		client.logger.info('logged in');
		//register slash
		console.log('Started refreshing application (/) commands.');
		await rest.put(Routes.applicationCommands(process.env.APP_ID), {
			body: commands
		});
		console.log('Successfully reloaded application (/) commands.');
		//handle
		// client.on('interactionCreate', async (interaction) => {
		// 	if (!interaction.isCommand()) return;
		// 	const command = client.stores.get('commands').get(interaction.commandName);
		// 	if (!command) return;
		// 	try {
		// 		command.execute(interaction);
		// 	} catch (error) {
		// 		client.logger.error('Error when run slash command');
		// 		client.logger.error(error);
		// 	}
		// });
		await cronJob.InitCron(client);
		client.loadArrayLottery();
		client.loadFishRateAndInfo();
		client.loadLanguageMappingVN();
		console.log('Successfully Init cron');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
