document.addEventListener('DOMContentLoaded', () => {
	const headers = {
		accept: 'application/json, text/plain, */*',
		'accept-language': 'ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
		'faceit-referer': 'new-frontend',
		priority: 'u=1, i',
		referer: 'https://www.faceit.com/ru/players/s1mle/stats/cs2',
		'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
		'sec-ch-ua-mobile': '?0',
		'sec-ch-ua-platform': '"Windows"',
		'sec-fetch-dest': 'empty',
		'sec-fetch-mode': 'cors',
		'sec-fetch-site': 'same-origin',
		'user-agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
	};

	const fetchStats = () => {
		const username = document.getElementById('username').value;
		if (!username) {
			alert('Пожалуйста, введите никнейм пользователя.');
			return;
		}

		fetch(`/proxy?url=https://www.faceit.com/api/users/v1/nicknames/${username}`, {
			method: 'GET',
			headers: headers,
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				const payload = data.payload;
				const avatarImg = document.getElementById('avatar');
				if (payload && payload.avatar) {
					avatarImg.src = payload.avatar;
					avatarImg.style.display = 'block';
				} else {
					avatarImg.style.display = 'none';
				}
				const country = document.getElementById('country');
				const icon = document.getElementById('country-icon');
				if (payload && payload.country) {
					country.textContent = payload.country.toUpperCase();
					icon.classList.add('fi', `fi-${payload.country}`);
				} else {
					country.style.display = 'none';
				}
				const gamesDiv = document.getElementById('games');
				gamesDiv.innerHTML = ''; // Очистить предыдущие результаты
				if (payload && payload.games) {
					Object.keys(payload.games).forEach((gameKey) => {
						const game = payload.games[gameKey];
						const gameDiv = document.createElement('div');
						gameDiv.innerHTML = `
            <h2>${gameKey.toUpperCase()}</h2>
            <p>Steam Name: ${game.game_name}</p>
            <p>Faceit Elo: ${game.faceit_elo}</p>
            <p>Region: ${game.region}</p>
            <p>Skill Level: ${game.skill_level}</p>
          `;
						gamesDiv.appendChild(gameDiv);
					});
				} else {
					console.error('Свойство не найдено в данных:', data);
				}
			})
			.catch((error) => {
				console.error('Ошибка:', error);
			});
	};

	document.getElementById('fetchStats').addEventListener('click', fetchStats);

	document.getElementById('username').addEventListener('keypress', (event) => {
		if (event.key === 'Enter') {
			fetchStats();
			document.getElementById('main-c').style.display = 'block';
		}
	});

	document.getElementById('clearStats').addEventListener('click', () => {
		document.getElementById('username').value = '';
		document.getElementById('avatar').style.display = 'none';
		document.getElementById('country').textContent = '';
		document.getElementById('country-icon').className = '';
		document.getElementById('games').innerHTML = '';
	});
});
