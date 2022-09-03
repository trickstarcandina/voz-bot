var cron = require('node-cron');
const { lotteryCronResult } = require('./lottery/lotteryShedulesResult');
const { lotteryCronInit } = require('./lottery/lotteryShedulesInit');
const { lotteryShedulesBackupLotteryArray } = require('./lottery/lotteryShedulesBackupLotteryArray');
const { luckyCron } = require('./lucky/luckySchedules');
const logger = require('../utils/logger');

exports.InitCron = async function (client) {
	try {
		// every min
		// cron.schedule(
		// 	'*/30 * * * * *',
		// 	async () => {
		// 		await luckyCron(client);
		// 	},
		// 	{
		// 		scheduled: true
		// 	}
		// );
		//backup lottery At :30 in every 2nd hour from 1am through 11pm
		cron.schedule(
			// '* * * * *',
			'30 1-23/2 * * *',
			async () => {
				await lotteryShedulesBackupLotteryArray(client);
				//clear cooldown
				client.options.timeouts.clear();
				client.options.spamTime.clear();
				client.options.spams.clear();
				console.log('Success clear cooldown and spam');
			},
			{
				scheduled: true
			}
		);
		// at 18h every day - GMT+7
		// GMT + 0 : 11h
		cron.schedule(
			// '* * * * *',
			'0 11 * * *',
			async () => {
				await lotteryCronResult(client);
				await luckyCron(client);
				await lotteryCronInit(client);
			},
			{
				scheduled: true
			}
		);
		// At minute 45 past every 3th hour
		// cron.schedule('45 */3 * * *', () => {}, {
		// 	scheduled: true
		// });
	} catch (e) {
		logger.error(e);
	}
};
