const languageMappingSchema = require('../schema/languageMapping');

module.exports.findByTypeAndLanguage = async function (language, type) {
	return await languageMappingSchema.find({
		language: language,
		type: type
	});
};

module.exports.findByLangLanguageMapping = async function (language) {
	return await languageMappingSchema.find({ language: language });
};

module.exports.findAllLanguageMapping = async function () {
	return await languageMappingSchema.find({});
};

module.exports.addNewLanguageMapping = async function (lang, type, key, value) {
	let langMapping = new languageMappingSchema({ language: lang, type: type, key: key, value: value });
	await langMapping.save().catch((err) => console.log(err));
	return langMapping;
};
