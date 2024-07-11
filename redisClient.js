const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: process.env.REDIS_PORT || 6379,
	password: process.env.REDIS_PASSWORD || '',
});

client.on('error', (err) => {
	console.error('Redis error:', err);
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

module.exports = {
	get: getAsync,
	set: setAsync,
};
