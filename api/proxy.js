const axios = require('axios');
const redis = require('redis');

const redisClient = redis.createClient({
	url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
	password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => {
	console.error('Ошибка Redis:', err);
});

redisClient.on('connect', () => {
	console.log('Подключение к Redis успешно.');
});

// Подключение к Redis
redisClient.connect().catch(console.error);

module.exports = async (req, res) => {
	const targetUrl = req.query.url;
	if (!targetUrl) {
		return res.status(400).send('URL параметр отсутствует');
	}

	try {
		const startTime = Date.now();
		const cacheKey = `cache:${targetUrl}`;
		const cachedData = await redisClient.get(cacheKey);

		if (cachedData) {
			console.log(`Cache hit (time: ${Date.now() - startTime}ms)`);
			return res.json(JSON.parse(cachedData));
		}

		const response = await axios.get(targetUrl, { timeout: 15000 });
		await redisClient.set(cacheKey, JSON.stringify(response.data), {
			EX: 3600,
		});
		console.log(
			`Cache miss, data saved to cache (time: ${Date.now() - startTime}ms)`,
			response.data,
		);

		res.json(response.data);
	} catch (error) {
		console.error('Ошибка при запросе к целевому URL:', error);
		res.status(500).send('Ошибка сервера: ' + error.message);
	}
};
