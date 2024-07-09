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
					avatarImg.src = '';
					avatarImg.src = payload.avatar;
					avatarImg.style.display = 'block';
				} else {
					avatarImg.src = './assets/Group1.png';
					avatarImg.style.display = 'block';
				}
				const country = document.getElementById('country');
				const icon = document.getElementById('country-icon');
				if (payload && payload.country) {
					country.textContent = payload.country.toUpperCase();
					icon.className = '';
					icon.classList.add('fi', `fi-${payload.country}`);
				} else {
					country.style.display = 'none';
				}
				const gamesDiv = document.getElementById('games');
				gamesDiv.innerHTML = ''; // Очистить предыдущие результаты
				if (payload && payload.games) {
					Object.keys(payload.games).forEach((gameKey) => {
						const game = payload.games[gameKey];
						if (gameKey === 'cs2' || gameKey === 'csgo') {
							const gameDiv = document.createElement('div');
							gameDiv.innerHTML = `
                            <h2>${gameKey.toUpperCase()}</h2>
                            <p>Steam Name: ${game.game_name}</p>
                            <p>Faceit Elo: ${game.faceit_elo}</p>
                            <p>Region: ${
															game.region === 'EU'
																? `<i class="fi fi-${game.region.toLowerCase()}"></i>`
																: ''
														} 
														${game.region}
														</p>
                            <p>Skill Level: <img src="https://cdn-frontend.faceit-cdn.net/web/static/media/assets_images_skill-icons_skill_level_${
															game.skill_level
														}_svg.svg" /></p>

                        `;
							gamesDiv.appendChild(gameDiv);
						}
					});
				} else {
					console.error('Свойство не найдено в данных:', data);
				}

				// Получение ID пользователя и запрос статистики матчей
				const userId = payload.id;
				fetchMatchStats(userId);
			})
			.catch((error) => {
				console.error('Ошибка:', error);
			});
	};

	const fetchMatchStats = (userId) => {
		const params = new URLSearchParams({
			page: '0',
			game_mode: '5v5',
		});

		fetch(
			`/proxy?url=https://www.faceit.com/api/stats/v1/stats/time/users/${userId}/games/cs2?${params.toString()}`,
			{
				method: 'GET',
				headers: headers,
			},
		)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
				}
				return response.json();
			})
			.then((data) => {
				const matches = data;
				if (matches && matches.length > 0) {
					let totalKills = 0;
					let totalDeaths = 0;
					let totalHeadShot = 0;
					let totalRounds = 0;
					let totalDamage = 0;
					let roundWadr = 0;
					let rWmatch = 0;
					matches.forEach((match) => {
						if (match.i20 !== undefined) {
							rWmatch += 1;
							totalDamage += parseInt(match.i20, 10);
							const allWadr = match.i18.split(' / ');
							if (allWadr.length === 2) {
								const wadr1 = parseInt(allWadr[0], 10);
								const wadr2 = parseInt(allWadr[1], 10);
								roundWadr += wadr1 + wadr2;
							}
						}
						totalKills += parseInt(match.i6, 10);
						totalDeaths += parseInt(match.i8, 10);
						totalHeadShot += parseInt(match.c4, 10);
						const rounds = match.i18.split(' / ');
						if (rounds.length === 2) {
							const round1 = parseInt(rounds[0], 10);
							const round2 = parseInt(rounds[1], 10);
							totalRounds += round1 + round2;
						}
					});

					const name = matches[0].nickname;
					const adr = totalDamage > 0 ? totalDamage / roundWadr : 'missing';
					const avgKills = totalKills / matches.length;
					const realKD = totalKills / totalDeaths; // K/D
					const headShot = totalHeadShot / matches.length;
					const kpr = totalKills / totalRounds;
					const elo = matches[0].elo;
					displayAverageStats(
						avgKills,
						realKD,
						matches.length,
						elo,
						headShot,
						kpr,
						adr,
						rWmatch,
						name,
					); // Передаем информацию о матчах
				} else {
					console.error('Матчи не найдены или пусты:', data);
				}
			})
			.catch((error) => {
				console.error('Ошибка:', error);
			});
	};

	const displayAverageStats = (avgKills, realKD, matchCount, elo, hs, kpr, adr, rW, username) => {
		function getIconLevel(elo) {
			if (elo <= 500) {
				return 1;
			} else if (elo <= 750) {
				return 2;
			} else if (elo <= 900) {
				return 3;
			} else if (elo <= 1050) {
				return 4;
			} else if (elo <= 1200) {
				return 5;
			} else if (elo <= 1350) {
				return 6;
			} else if (elo <= 1530) {
				return 7;
			} else if (elo <= 1750) {
				return 8;
			} else if (elo <= 2000) {
				return 9;
			} else {
				return 10;
			}
		}

		const avgKillsDiv = document.getElementById('average-kills');
		avgKillsDiv.innerHTML = `
														<h1 class="username">${username}</h1>
														<div class="elo-container">
															<h2>Current ELO: ${elo}</h2>
															<div class="current-elo">
																<img class="iconLevel" src="https://cdn-frontend.faceit-cdn.net/web/static/media/assets_images_skill-icons_skill_level_${getIconLevel(
																	elo,
																)}_svg.svg" />
															</div>
														</div>
														<br>
														<p class="stat-m">Statistic for matches: ${matchCount}</p>
														<div class="list-cont">
															<p>AVG kills: ${avgKills.toFixed(2)}</p>
															<p>Real KD: ${realKD.toFixed(2)}</p>
															<p>KPR: ${kpr.toFixed(2)}</p>
															<p>HeadShots: ${hs.toFixed(0)}%</p>
															${adr !== 'missing' ? `<p>ADR per ${rW} matches: ${adr.toFixed(1)}</p>` : ''}
														</div>
														`;
		avgKillsDiv.style.display = 'block';
	};

	document.getElementById('fetchStats').addEventListener('click', fetchStats);

	document.getElementById('username').addEventListener('keypress', (event) => {
		if (event.key === 'Enter') {
			fetchStats();
			document.getElementById('main-c').style.display = 'block';
			document.getElementById('title-All-games').style.display = 'block';
		}
	});

	document.getElementById('clearStats').addEventListener('click', () => {
		document.getElementById('username').value = '';
		document.getElementById('avatar').style.display = 'none';
		document.getElementById('country').textContent = '';
		document.getElementById('country-icon').className = '';
		document.getElementById('games').innerHTML = '';
		document.getElementById('average-kills').style.display = 'none';
		document.getElementById('title-All-games').style.display = 'none';
	});
});
