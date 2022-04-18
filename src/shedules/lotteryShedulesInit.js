exports.lotteryCronInit = async function (client) {
	let arrayType2 = [];
	let arrayType3 = [];
	let arrayType4 = [];
	let arrayType5 = [];
	for (let i = 0; i < 100; i++) {
		arrayType2.push(i);
	}
	for (let i = 100; i < 1000; i++) {
		arrayType3.push(i);
	}
	for (let i = 1000; i < 10000; i++) {
		arrayType4.push(i);
	}
	for (let i = 10000; i < 100000; i++) {
		arrayType5.push(i);
	}
	await randomArray(client, arrayType2, 2);
	await randomArray(client, arrayType3, 3);
	await randomArray(client, arrayType4, 4);
	await randomArray(client, arrayType5, 5);
};

async function randomArray(client, array, typeLottery) {
	let max = array.length - 1;
	for (let i = 0; i < array.length; i++) {
		let random = Math.floor(Math.random() * max);
		let swap = array[max];
		array[max] = array[random];
		array[random] = swap;
		max--;
	}
	return await client.db.initLotteryResult(array, typeLottery);
}
