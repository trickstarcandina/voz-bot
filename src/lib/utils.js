const { send } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { RandomLoadingMessage } = require('./constants');

function pickRandom(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function sendLoadingMessage(message) {
	return send(message, { embeds: [new MessageEmbed().setDescription(pickRandom(RandomLoadingMessage)).setColor('#FF0000')] });
}

async function returnContentForSlashOrSendMessage(message, content) {
	if (message.type === 'APPLICATION_COMMAND') {
		return content;
	}
	return await send(message, content);
}

async function returnSlashAndMessage(message, content) {
	if (message.type === 'APPLICATION_COMMAND') {
		return await message.reply(content);
	}
	return await send(message, content);
}

function smallNumberDisplay(count, digits) {
	const numbers = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
	var result = '';
	for (i = 0; i < digits; i++) {
		var digit = count % 10;
		count = Math.trunc(count / 10);
		result = numbers[digit] + result;
	}
	return result;
}

// async function sendCaptcha(image, message, content) {
// 	if (message.type === 'APPLICATION_COMMAND') {
// 		return await message.reply({
// 			embeds: [
// 				new MessageEmbed()
// 					.setTitle('⚠ CAPTCHA ⚠ CAPTCHA ⚠ CAPTCHA')
// 					.setDescription(content)
// 					.setColor('#FF0000')
// 					.setImage('attachment://captcha.png')
// 			],
// 			files: [{ name: 'captcha.png', attachment: image }]
// 		});
// 	}
// 	return await send(message, {
// 		embeds: [
// 			new MessageEmbed()
// 				.setTitle('⚠ CAPTCHA ⚠ CAPTCHA ⚠ CAPTCHA')
// 				.setDescription(content)
// 				.setColor('#FF0000')
// 				.setImage('attachment://captcha.png')
// 		],
// 		files: [{ name: 'captcha.png', attachment: image }]
// 	});
// }

async function sendCaptchaImage(userId, client, image, text, message, content) {
	client.options.spams.set(`${userId}`, 'warn');
	await client.db.updateCaptcha(userId, {
		discordId: userId,
		captcha: text,
		deadline: new Date(Date.now() + 600000),
		isResolve: false
	});
	if (message.type === 'APPLICATION_COMMAND') {
		return await message.reply({
			embeds: [
				new MessageEmbed()
					.setTitle('⚠ CAPTCHA ⚠ CAPTCHA ⚠ CAPTCHA')
					.setDescription(content)
					.setColor('#FF0000')
					.setImage('attachment://captcha.png')
			],
			files: [{ name: 'captcha.png', attachment: image }]
		});
	}
	return await send(message, {
		embeds: [
			new MessageEmbed()
				.setTitle('⚠ CAPTCHA ⚠ CAPTCHA ⚠ CAPTCHA')
				.setDescription(content)
				.setColor('#FF0000')
				.setImage('attachment://captcha.png')
		],
		files: [{ name: 'captcha.png', attachment: image }]
	});
}

function getKeyByValueMap(map, searchValue) {
	for (let [key, value] of map.entries()) {
		if (value === searchValue) return key;
	}
}

module.exports.pickRandom = pickRandom;
module.exports.sendLoadingMessage = sendLoadingMessage;
module.exports.returnContentForSlashOrSendMessage = returnContentForSlashOrSendMessage;
module.exports.returnSlashAndMessage = returnSlashAndMessage;
module.exports.smallNumberDisplay = smallNumberDisplay;
module.exports.sendCaptchaImage = sendCaptchaImage;
module.exports.getKeyByValueMap = getKeyByValueMap;
