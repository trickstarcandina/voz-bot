require('dotenv').config();
const mongoose = require('mongoose');

module.exports = mongoose.model(
	'RateConfig',
	new mongoose.Schema(
		{
			location: { type: String, unique: true },
			array: { type: Array, default: [] },
			normal: { type: Number, default: 0 },
			rare: { type: Number, default: 0 },
			super: { type: Number, default: 0 },
			ultra: { type: Number, default: 0 },
			ultimate: { type: Number, default: 0 },
			legend: { type: Number, default: 0 }
		},

		{
			timestamps: true
		}
	)
);
