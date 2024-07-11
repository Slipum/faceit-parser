const axios = require('axios');
const redis = require('../redisClient');

module.exports = async (req, res) => {
	const targetUrl = req.query.url;
	if (!targetUrl) {
		return res.status(400).send('URL параметр отсутствует');
	}

	try {
		// Проверяем наличие данных в кэше Redis
		const cacheKey = `cache:${targetUrl}`;
		const cachedData = await redis.get(cacheKey);

		if (cachedData) {
			console.log('Cache hit');
			return res.json(JSON.parse(cachedData));
		}

		// Если данных нет в кэше, выполняем запрос
		const response = await axios.get(targetUrl);

		// Сохраняем данные в кэше на 1 час
		await redis.set(cacheKey, JSON.stringify(response.data), 'EX', 3600);
		console.log('Cache miss, data saved to cache', response.data);

		res.json(response.data);
	} catch (error) {
		console.error('Ошибка при запросе к целевому URL:', error);
		res.status(500).send('Ошибка сервера');
	}
};
