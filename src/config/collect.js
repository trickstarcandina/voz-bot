module.exports = {
	fishing: {
		buy: 100,
		listname: [
			'frog',
			'eel',
			'carp',
			'shark',
			'whale',
			'crocodile',
			'squid',
			'kraken',
			'mermaid',
			'cá 3 tủi',
			'ray',
			'crab',
			'shrimp',
			'jellyfish',
			'dolphin'
		],
		listnameVN: [
			'ếch',
			'lươn',
			'cá chép',
			'cá mập',
			'cá voi',
			'cá sấu',
			'mực',
			'kraken',
			'người cá',
			'cá 3 tủi',
			'cá đuối',
			'cua',
			'tôm',
			'sứa',
			'cá heo'
		],
		special: ['cá 3 tủi'],
		tub: [{ rate: 1, name: ['frog'] }],
		lake: [
			{ rate: 0.8, name: ['frog', 'crab', 'shrimp', 'eel'] },
			{ rate: 0.92, name: ['cá 3 tủi'] },
			{ rate: 1, name: ['fail'] }
		],
		river: [
			{ rate: 0.6, name: ['frog', 'crab', 'shrimp'] },
			{ rate: 0.75, name: ['carp'] },
			{ rate: 0.85, name: ['crocodile'] },
			{ rate: 1, name: ['fail'] }
		],
		sea: [
			{ rate: 0.7, name: ['ray', 'crab', 'shrimp', 'jellyfish', 'squid'] },
			{ rate: 0.77, name: ['dolphin', 'shark'] }, // 0.03
			{ rate: 0.8, name: ['crocodile', 'whale'] }, // 0.01
			{ rate: 0.80005, name: ['kraken'] },
			{ rate: 0.800051, name: ['mermaid'] },
			{ rate: 1, name: ['fail'] }
		]
	}
};
