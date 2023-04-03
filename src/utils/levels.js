module.exports = async function levels(message, client) {
	// exist -> if yes update else create
	return await client.db.upsertUser(message.author.id, {
		$inc: {
			money: Math.floor(Math.random() * 8) + 1
		}
	});
};
