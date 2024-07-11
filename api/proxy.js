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
			return res.json(JSON.parse(cachedData));
		}

		console.log(`Cache miss (time: ${Date.now() - startTime}ms)`);

		// Если данных нет в кэше, выполняем запрос
		const response = await axios.get(targetUrl);

		// Сохраняем данные в кэше на 1 час
		await kv.set(cacheKey, JSON.stringify(response.data), {
			ex: 3600, // Время жизни кэша в секундах
		});
		console.log(`Data saved to cache (time: ${Date.now() - startTime}ms)`);

		res.json(response.data);
	} catch (error) {
		console.error('Ошибка при запросе к целевому URL:', error);
		res.status(500).send('Ошибка сервера: ' + error.message);
	}
};
