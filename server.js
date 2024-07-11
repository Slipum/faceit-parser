const express = require('express');
const path = require('path');
const axios = require('axios');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const redis = require('redis');
require('dotenv').config();

const app = express();

// Создаем и запускаем сервер LiveReload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

// Используем connect-livereload для вставки скрипта LiveReload в HTML
app.use(connectLivereload());

// Настройка маршрута для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Инициализация клиента Redis
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
		// Проверяем наличие данных в кэше Redis
		const cacheKey = `cache:${targetUrl}`;
		const cachedData = await redisClient.get(cacheKey);

		if (cachedData) {
			console.log('Cache hit');
			return res.json(JSON.parse(cachedData));
		}

		// Если данных нет в кэше, выполняем запрос
		const response = await axios.get(targetUrl);

		// Сохраняем данные в кэше на 1 час
		await redisClient.set(cacheKey, JSON.stringify(response.data), {
			EX: 3600, // Время жизни кэша в секундах
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

// Сообщаем серверу LiveReload об изменениях
liveReloadServer.server.once('connection', () => {
	setTimeout(() => {
		liveReloadServer.refresh('/');
	}, 100);
});
