const { fetchT } = require('@sapphire/plugin-i18next');
const utils = require('../../lib/utils');

module.exports = async function reminderCaptcha(message, client, userId, tag) {
	// type channel
	// get cache and check

	// reminder
	let captchaUser = await client.db.getCaptchaByDiscordId(userId);
	const t = await fetchT(message);
	if (captchaUser === null || captchaUser.isBlock === true || captchaUser.isResolve === true) {
		return;
	}
	if (captchaUser.reminder > 4 || captchaUser.deadline < Date.now()) {
		//ban
		await client.db.updateCaptcha(userId, {
			wrong: 0,
			reminder: 0,
			isBlock: true,
			timeBlock: new Date(Date.now() + 10800000)
		});
		return await utils.returnSlashAndMessage(
			message,
			t('commands/captcha:ban', {
				user: tag
			})
		);
	}
	await client.db.updateCaptcha(userId, {
		$inc: {
			reminder: 1
		}
	});
	return await utils.returnSlashAndMessage(
		message,
		t('commands/captcha:reminder', {
			user: tag,
			turn: captchaUser.reminder + 1
		})
	);
};