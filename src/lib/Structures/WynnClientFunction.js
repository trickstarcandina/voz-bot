const { container } = require('@sapphire/framework');
const { createCaptcha } = require('../../utils/index');

module.exports.fetchPrefix = async function fetchPrefix(message) {
	if (message.guild === null) return process.env.PREFIX;
	const guild = await this.db.fetchGuild(message.guild.id);
	return guild.prefix;
};

module.exports.checkTimeCoolDown = async function checkTimeCoolDown(id, name, delay, t) {
	if (process.env.OWNER_IDS.split(',').includes(id)) {
		return;
	}
	const getTimeout = container.client.options.timeouts.get(`${id}_${name}`) || 0;
	if (Date.now() - getTimeout < 0) {
		return t('preconditions:preconditionCooldown', {
			remaining: `\`${(getTimeout - Date.now()) / 1000}s\``
		});
	}
	container.client.options.timeouts.set(`${id}_${name}`, Date.now() + (delay || 0));
};

module.exports.checkTimeCoolDownWithCheckSpam = async function checkTimeCoolDownWithCheckSpam(id, name, delay, t) {
	if (process.env.OWNER_IDS.split(',').includes(id)) {
		return;
	}
	let dateNow = Date.now();
	//timeout cooldown
	const getTimeout = container.client.options.timeouts.get(`${id}_${name}`) || 0;
	if (dateNow - getTimeout < 0) {
		return t('preconditions:preconditionCooldown', {
			remaining: `\`${(getTimeout - dateNow) / 1000}s\``
		});
	}
	container.client.options.timeouts.set(`${id}_${name}`, dateNow + (delay || 0));
	if (process.env.WHITE_LIST.split(',').includes(id)) {
		return;
	}
	//spamTime
	let spamTime = container.client.options.spamTime.get(`${id}_${name}`);
	if (spamTime !== undefined) {
		// check
		let arraySpamTime = spamTime.split('_');
		if (arraySpamTime.length > 9) {
			let subRequest = Number(arraySpamTime[2]) - Number(arraySpamTime[1]);
			let point = 0;
			for (let i = 2; i < arraySpamTime.length - 1; i++) {
				if (Math.abs(Number(arraySpamTime[i + 1]) - Number(arraySpamTime[i]) - subRequest) < 2000) {
					point++;
				}
			}
			if (point > 5) {
				return await createCaptcha(true);
			}
		}
	}
	container.client.options.spamTime.set(`${id}_${name}`, spamTime + '_' + dateNow.toString());
	//spams
	let countSpam = container.client.options.spams.get(`${id}`) || 0;
	if (countSpam > 22) {
		//sent captcha
		return await createCaptcha(true);
	} else {
		countSpam++;
		container.client.options.spams.set(`${id}`, countSpam);
	}
};

module.exports.resetCooldown = async function resetCooldown(idUser, command) {
	let mapCooldown = container.stores.get('preconditions').get('Cooldown').buckets.get(command);
	let valueOfCooldown = mapCooldown.get(idUser);
	valueOfCooldown.expires = Date.now() + 5000;
	return mapCooldown.set(idUser, valueOfCooldown);
	// console.log(mapCooldown.get('662508642251309057'));
};

module.exports.setCustomCooldown = async function setCustomCooldown(id, name, time) {
	return container.client.options.timeouts.set(`${id}_${name}`, Date.now() + time);
};

module.exports.resetCustomCooldown = async function resetCustomCooldown(id, name) {
	return container.client.options.timeouts.set(`${id}_${name}`, Date.now() + 8000);
};

module.exports.loadArrayLottery = async function loadArrayLottery() {
	const arrayLottery = await this.db.loadArrayLottery();
	//server go off load backup
	for (let i = 0; i < arrayLottery.length; i++) {
		if (arrayLottery[i].arrayBackup.length > 0) {
			container.client.options.lottery.push(arrayLottery[i].arrayBackup);
		} else {
			container.client.options.lottery.push(arrayLottery[i].arrayInit);
		}
	}
};

module.exports.setArrayLottery = async function setArrayLottery(arrayType2, arrayType3, arrayType4, arrayType5) {
	container.client.options.lottery = [];
	container.client.options.lottery.push(arrayType2);
	container.client.options.lottery.push(arrayType3);
	container.client.options.lottery.push(arrayType4);
	container.client.options.lottery.push(arrayType5);
};

module.exports.loadFishRateAndInfo = async function loadFishRateAndInfo() {
	const arrayInfo = await this.db.getAllRateConfig();
	let infoFish = new Map();
	arrayInfo.forEach((element) => {
		container.client.options.fish.set(element.location, {
			fish: element.array,
			rate: new Map([
				['normal', element.normal],
				['rare', element.rare],
				['super', element.super],
				['ultra', element.ultra],
				['ultimate', element.ultimate],
				['legend', element.legend]
			])
		});
		element.array.forEach((e) => {
			infoFish.set(e.name, e);
		});
	});
	let nameFish = [];
	const iterator = infoFish.keys();
	while (true) {
		const name = iterator.next().value;
		if (name !== undefined) {
			nameFish.push(name);
		} else {
			break;
		}
	}
	container.client.options.fish.set('listname', nameFish);
	container.client.options.fish.set('listinfo', infoFish);
	console.log('listname');
	console.log(container.client.options.fish.get('listname'));
	console.log('listinfo');
	console.log(container.client.options.fish.get('listinfo'));
};

module.exports.loadLanguageMappingVN = async function loadLanguageMappingVN() {
	const langMappingArray = await this.db.findByLangLanguageMapping('vi-VN');
	langMappingArray.sort(function (a, b) {
		let asc1 = a.type[0].charCodeAt(0);
		let asc2 = b.type[0].charCodeAt(0);
		if (asc1 < asc2) return -1;
		if (asc1 > asc2) return 1;
		return 0;
	});
	let map = new Map();
	let mapTemp = new Map();
	for (let index = 0; index < langMappingArray.length; index++) {
		if (index > 0 && index < langMappingArray.length - 1 && langMappingArray[index].type !== langMappingArray[index + 1].type) {
			map.set(langMappingArray[index].type, mapTemp);
			mapTemp.clear();
		}
		mapTemp.set(langMappingArray[index].key, langMappingArray[index].value);
	}
	if (langMappingArray[langMappingArray.length - 1] === undefined) {
		return;
	}
	map.set(langMappingArray[langMappingArray.length - 1].type, mapTemp);
	container.client.options.fish.set('vi-VN', map);
	container.client.options.fish.set('listnameVN', Array.from(map.get('namefish').values()));
	console.log('listnameVN');
	console.log(container.client.options.fish.get('listnameVN'));
	console.log(container.client.options.fish.get('vi-VN'));
};
