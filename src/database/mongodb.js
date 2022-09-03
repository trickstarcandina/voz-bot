const { fetchGuild, updateGuild } = require('./query/guild');
module.exports.fetchGuild = fetchGuild;
module.exports.updateGuild = updateGuild;
/* User */
const { fetchUser, updateUser, checkExistUser, transactionItemUser, upsertUser, updateListWinner } = require('./query/user');
module.exports.fetchUser = fetchUser;
module.exports.updateUser = updateUser;
module.exports.checkExistUser = checkExistUser;
module.exports.transactionItemUser = transactionItemUser;
module.exports.upsertUser = upsertUser;
module.exports.updateListWinner = updateListWinner;
/* Daily */
const { getDailyInfo, setDailyInfo } = require('./query/daily');
module.exports.getDailyInfo = getDailyInfo;
module.exports.setDailyInfo = setDailyInfo;
/* Lottery */
const {
	clearLotteryArray,
	initLottery,
	loadArrayLottery,
	saveArrayLottery,
	getLotteryResult,
	getLastResultLottery,
	getLotteryResultByType,
	updateCountLotteryResult,
	updateLotteryResult,
	createNewLottery,
	getListWiner,
	clearLotteryUser,
	findAllLotteryByDiscordId
} = require('./query/lottery');
module.exports.clearLotteryArray = clearLotteryArray;
module.exports.initLottery = initLottery;
module.exports.loadArrayLottery = loadArrayLottery;
module.exports.saveArrayLottery = saveArrayLottery;
module.exports.getLotteryResult = getLotteryResult;
module.exports.getLastResultLottery = getLastResultLottery;
module.exports.getLotteryResultByType = getLotteryResultByType;
module.exports.updateCountLotteryResult = updateCountLotteryResult;
module.exports.updateLotteryResult = updateLotteryResult;
module.exports.createNewLottery = createNewLottery;
module.exports.getListWiner = getListWiner;
module.exports.clearLotteryUser = clearLotteryUser;
module.exports.findAllLotteryByDiscordId = findAllLotteryByDiscordId;
/* Channel */
const { fetchChannel, updateChannel } = require('./query/channel');
module.exports.fetchChannel = fetchChannel;
module.exports.updateChannel = updateChannel;
/* Lucky */
const { addNewBetLucky, getAllBetLucky, clearBetLucky, findAllLuckyByDiscordId } = require('./query/lucky');
module.exports.addNewBetLucky = addNewBetLucky;
module.exports.getAllBetLucky = getAllBetLucky;
module.exports.clearBetLucky = clearBetLucky;
module.exports.findAllLuckyByDiscordId = findAllLuckyByDiscordId;
/* Fish */
const { getFishByName, getAllFish, addNewFish } = require('./query/fish');
module.exports.getFishByName = getFishByName;
module.exports.getAllFish = getAllFish;
module.exports.addNewFish = addNewFish;
/* ItemFish */
const { getItemFishByDiscordId, updateItemFish } = require('./query/itemFish');
module.exports.getItemFishByDiscordId = getItemFishByDiscordId;
module.exports.updateItemFish = updateItemFish;
/* Captcha */
const { getCaptchaByDiscordId, updateCaptcha, checkIsBlock } = require('./query/captcha');
module.exports.getCaptchaByDiscordId = getCaptchaByDiscordId;
module.exports.updateCaptcha = updateCaptcha;
module.exports.checkIsBlock = checkIsBlock;
/*  RateConfig */
const { addNewRateConfig, updateRateConfig, getAllRateConfig } = require('./query/rateConfig');
module.exports.addNewRateConfig = addNewRateConfig;
module.exports.updateRateConfig = updateRateConfig;
module.exports.getAllRateConfig = getAllRateConfig;
/* Language Mapping */
const { findByTypeAndLanguage, findByLangLanguageMapping, findAllLanguageMapping, addNewLanguageMapping } = require('./query/languageMapping');
module.exports.findByTypeAndLanguage = findByTypeAndLanguage;
module.exports.findByLangLanguageMapping = findByLangLanguageMapping;
module.exports.findAllLanguageMapping = findAllLanguageMapping;
module.exports.addNewLanguageMapping = addNewLanguageMapping;
