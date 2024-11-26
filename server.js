const express = require('express');
const path = require('path');
const axios = require('axios');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const redis = require('redis');
require('dotenv').config();

const app = express();

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));
app.use(connectLivereload());
app.use(express.static(path.join(__dirname, 'public')));

const redisClient = redis.createClient();

redisClient.on('error', (err) => {
	console.error('Ошибка Redis:', err);
});

redisClient.on('connect', () => {
	console.log('Подключение к Redis успешно.');
});

// Подключение к Redis
redisClient.connect().catch(console.error);

// Маршрут для отправки главной страницы
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для проксирования запросов
app.get('/proxy', async (req, res) => {
	const targetUrl = req.query.url;
	if (!targetUrl) {
		return res.status(400).send('URL параметр отсутствует');
	}

	try {
		const cacheKey = `cache:${targetUrl}`;
		const cachedData = await redisClient.get(cacheKey);

		if (cachedData) {
			console.log('Cache hit');
			return res.json(JSON.parse(cachedData));
		}

		const response = await axios.get(targetUrl);

		await redisClient.set(cacheKey, JSON.stringify(response.data), {
			EX: 3600,
		});
		console.log('Cache miss, data saved to cache', response.data);

		res.json(response.data);
	} catch (error) {
		console.error('Ошибка при запросе к целевому URL:', error);
		res.status(500).send('Ошибка сервера: ' + error.message);
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Сервер запущен на порту ${PORT}`);
});

liveReloadServer.server.once('connection', () => {
	setTimeout(() => {
		liveReloadServer.refresh('/');
	}, 100);
});
