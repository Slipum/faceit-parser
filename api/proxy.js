const axios = require('axios');
const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
	const targetUrl = req.query.url;
	if (!targetUrl) {
		return res.status(400).send('URL параметр отсутствует');
	}

	try {
		const startTime = Date.now();
		console.log(`Запрос кэширования для: ${targetUrl}`);

		// Проверяем наличие данных в кэше Vercel KV
		const cacheKey = `cache:${targetUrl}`;
		const cachedData = await kv.get(cacheKey);

		if (cachedData) {
			console.log(`Cache hit (time: ${Date.now() - startTime}ms)`);
			try {
				const jsonData = JSON.parse(cachedData);
				return res.json(jsonData);
			} catch (error) {
				console.error('Ошибка при разборе данных из кэша:', error);
				return res.status(500).send('Ошибка при разборе данных из кэша');
			}
		}

		console.log(`Cache miss (time: ${Date.now() - startTime}ms)`);

		// Если данных нет в кэше, выполняем запрос
		const response = await axios.get(targetUrl, { timeout: 15000 });

		// Сохраняем данные в кэше Vercel KV на 1 час
		await kv.put(cacheKey, JSON.stringify(response.data), {
			ttl: 3600, // Время жизни кэша в секундах (ttl)
		});
		console.log(`Data saved to cache (time: ${Date.now() - startTime}ms)`);

		res.json(response.data);
	} catch (error) {
		console.error('Ошибка при запросе к целевому URL:', error);
		res.status(500).send('Ошибка сервера: ' + error.message);
	}
};
