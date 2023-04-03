const rateConfigSchema = require('../schema/rateConfig');

module.exports.addNewRateConfig = async function (location, arrayFish) {
	let rateConfig = new rateConfigSchema({
		location: location,
		array: arrayFish
	});
	await rateConfig.save().catch((err) => console.log(err));
	return rateConfig;
};

module.exports.updateRateConfig = async function (location, fieldUpdate) {
	return await rateConfigSchema.updateOne({ location: location }, fieldUpdate);
};

module.exports.getAllRateConfig = async function () {
	return await rateConfigSchema.find({});
};
