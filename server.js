const express = require('express');
const path = require('path');
const axios = require('axios');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();

// Создаем и запускаем сервер LiveReload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

// Используем connect-livereload для вставки скрипта LiveReload в HTML
app.use(connectLivereload());

// Настройка маршрута для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

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
		const response = await axios.get(targetUrl);
		res.json(response.data);
	} catch (error) {
		console.error('Ошибка при запросе к целевому URL:', error);
		res.status(500).send('Ошибка сервера');
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
