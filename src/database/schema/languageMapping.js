require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'LanguageMapping',
	new mongoose.Schema({
		language: { type: String },
		type: { type: String }, //namefish, ...
		key: { type: String },
		value: { type: String }
	})
);
