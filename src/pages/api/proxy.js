export default async function handler(req, res) {
	const { url } = req.query;

	if (!url) {
		return res.status(400).json({ error: 'URL parameter is required' });
	}

	const headers = {
		accept: 'application/json, text/plain, */*',
		'faceit-referer': 'new-frontend',
		'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
	};

	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			throw new Error(`Faceit API Error: ${response.status} - ${response.statusText}`);
		}

		const data = await response.json();
		res.status(200).json(data);
	} catch (error) {
		console.error('Proxy error:', error);
		res.status(500).json({ error: error.message });
	}
}
