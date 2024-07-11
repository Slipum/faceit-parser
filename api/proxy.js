const express = require('express');
const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');

const app = express();
const client = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PASSWORD,
});
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Маршрут для проксирования запросов
app.get('/', async (req, res) => {
	const targetUrl = req.query.url;
	if (!targetUrl) {
		return res.status(400).send('URL параметр отсутствует');
	}

	// Проверка кэша в Redis
	try {
		const cachedData = await getAsync(targetUrl);
		if (cachedData) {
			console.log('Данные найдены в Redis кэше');
			return res.json(JSON.parse(cachedData));
		}

		// Если данных нет в кэше, делаем запрос и сохраняем в Redis
		const response = await axios.get(targetUrl);
		await setAsync(targetUrl, JSON.stringify(response.data));
		res.json(response.data);
	} catch (error) {
		console.error('Ошибка при запросе к целевому URL:', error);
		res.status(500).send('Ошибка сервера');
	}
});

module.exports = app;
