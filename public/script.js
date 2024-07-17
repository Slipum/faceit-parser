document.addEventListener('DOMContentLoaded', () => {
	let eloChart = null;

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
		var username = document.getElementById('username').value;
		if (!username) {
			alert('Пожалуйста, введите никнейм пользователя или ссылку.');
			return;
		}
		const baseURL = 'https://www.faceit.com/ru/players/';
		if (username.startsWith(baseURL)) {
			username = username.replace(baseURL, '');
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
					avatarImg.src = './assets/Group1.png';
					avatarImg.style.display = 'block';
				}
				if (payload.cover_image_url) {
					const userBackElement = document.getElementById('user-back');
					userBackElement.style.backgroundImage = `url('${payload.cover_image_url}')`;
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
				gamesDiv.innerHTML = '';
				if (payload && payload.games) {
					Object.keys(payload.games).forEach((gameKey) => {
						const game = payload.games[gameKey];
						if (gameKey === 'cs2' || gameKey === 'csgo') {
							const gameDiv = document.createElement('div');
							gameDiv.innerHTML = `
													<h2>${gameKey.toUpperCase()}</h2>
													<p>Steam Name: ${game.game_name}</p>
													<p>Faceit Elo: ${game.faceit_elo}</p>
													<p>Region: ${game.region === 'EU' ? `<i class="fi fi-${game.region.toLowerCase()}"></i>` : ''} 
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
				const currentElo = payload.games.cs2.faceit_elo;
				fetchMatchStats(userId, currentElo);
			})
			.catch((error) => {
				console.error('Ошибка:', error);
			});
	};

	const fetchMatchStats = (userId, currentElo) => {
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
					let totalGame = [];
					let mc = 1;

					const matchesDiv = document.getElementById('matches');
					matchesDiv.innerHTML = `
						<table>
							<thead>
								<tr>
									<th>Match</th>
									<th>Date</th>
									<th>Map</th>
									<th>Score</th>
									<th>Kills</th>
									<th>Assists</th>
									<th>Deaths</th>
									<th>K/D</th>
									<th>K/R</th>
									<th>ADR</th>
									<th>ELO</th>
								</tr>
							</thead>
							<tbody>
							</tbody>
						</table>`;
					let previousElo = null;
					const matchesTableBody = matchesDiv.querySelector('tbody');
					matches.reverse();

					let lastSessionDate = null;
					let wins = 0;
					let totalMatchesToday = 0;

					function getIconMap(map) {
						const maps = {
							de_mirage:
								'https://assets.faceit-cdn.net/third_party/games/ce652bd4-0abb-4c90-9936-1133965ca38b/assets/votables/7fb7d725-e44d-4e3c-b557-e1d19b260ab8_1695819144685.jpeg',
							de_vertigo:
								'https://assets.faceit-cdn.net/third_party/games/ce652bd4-0abb-4c90-9936-1133965ca38b/assets/votables/3bf25224-baee-44c2-bcd4-f1f72d0bbc76_1695819180008.jpeg',
							de_ancient:
								'https://assets.faceit-cdn.net/third_party/games/ce652bd4-0abb-4c90-9936-1133965ca38b/assets/votables/5b844241-5b15-45bf-a304-ad6df63b5ce5_1695819190976.jpeg',
							de_dust2:
								'https://assets.faceit-cdn.net/third_party/games/ce652bd4-0abb-4c90-9936-1133965ca38b/assets/votables/7c17caa9-64a6-4496-8a0b-885e0f038d79_1695819126962.jpeg',
							de_anubis:
								'https://assets.faceit-cdn.net/third_party/games/ce652bd4-0abb-4c90-9936-1133965ca38b/assets/votables/31f01daf-e531-43cf-b949-c094ebc9b3ea_1695819235255.jpeg',
							de_nuke:
								'https://assets.faceit-cdn.net/third_party/games/ce652bd4-0abb-4c90-9936-1133965ca38b/assets/votables/7197a969-81e4-4fef-8764-55f46c7cec6e_1695819158849.jpeg',
							de_inferno:
								'https://assets.faceit-cdn.net/third_party/games/ce652bd4-0abb-4c90-9936-1133965ca38b/assets/votables/993380de-bb5b-4aa1-ada9-a0c1741dc475_1695819220797.jpeg',
						};
						return `<img src="${maps[map] || ''}" />`;
					}

					// Функция для вычисления изменений Elo
					function getEloChange(currentElo, previousElo, matchDate) {
						if (previousElo === null) return currentElo;

						const eloChange = currentElo - previousElo;
						const changeText = eloChange > 0 ? `(+${eloChange})` : `(${eloChange})`;
						const changeClass = eloChange > 0 ? 'elo-positive' : 'elo-negative';

						if (!(matchDate instanceof Date)) {
							matchDate = new Date(matchDate);
						}

						const sessionThresholdHours = 5; // Количество часов для объединения сессий
						const sessionThreshold = new Date(matchDate);
						sessionThreshold.setHours(sessionThreshold.getHours() - sessionThresholdHours);

						if (
							lastSessionDate === null ||
							(matchDate.toDateString() !== lastSessionDate.toDateString() &&
								matchDate > sessionThreshold)
						) {
							lastSessionDate = matchDate;
							wins = 0;
							totalMatchesToday = 0;
						}

						totalMatchesToday++;
						if (eloChange > 0) {
							wins++;
						}

						return `<span class="${changeClass}">${currentElo} ${changeText}</span>`;
					}

					// Функция для получения статистики последней сессии
					function getLastSessionStats() {
						return {
							date: lastSessionDate,
							wins: wins,
							totalMatches: totalMatchesToday,
						};
					}

					const rows = matches.map((match, index) => {
						const matchRow = document.createElement('tr');
						let img = match.i1;

						const eloDisplay =
							match.elo !== undefined
								? getEloChange(match.elo, previousElo, match.date)
								: '<i class="fa-solid fa-rectangle-xmark"></i>';
						previousElo = match.elo;

						matchRow.innerHTML = `
							<td><a href="https://www.faceit.com/ru/cs2/room/${
								match.matchId
							}/scoreboard" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-up-right-from-square"></i></a> ${mc}</td>
							<td class='date'>${new Date(match.date).toLocaleDateString()}<p>(${new Date(
							match.date,
						).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})})</p></td>
							<td>${match.i1 !== undefined ? getIconMap(img) : '<i class="fa-solid fa-rectangle-xmark"></i>'}</td>
							<td>${match.i18 !== undefined ? match.i18 : '<i class="fa-solid fa-rectangle-xmark"></i>'}</td>
							<td>${match.i6 !== undefined ? match.i6 : '<i class="fa-solid fa-rectangle-xmark"></i>'}</td>
							<td>${match.i7 !== undefined ? match.i7 : '<i class="fa-solid fa-rectangle-xmark"></i>'}</td>
							<td>${match.i8 !== undefined ? match.i8 : '<i class="fa-solid fa-rectangle-xmark"></i>'}</td>
							<td class='${
								match.c2 >= 1
									? match.c2 >= 1.3
										? 'td-solid-green'
										: 'td-green'
									: match.c2 <= 0.7
									? 'td-solid-red'
									: 'td-red'
							}'>
							${match.c2 !== undefined ? match.c2 : '<i class="fa-solid fa-rectangle-xmark"></i>'}</td>
							<td class='${
								match.c3 >= 0.75
									? match.c3 >= 0.9
										? 'td-solid-green'
										: 'td-green'
									: match.c3 <= 0.5
									? 'td-solid-red'
									: 'td-red'
							}'>
							${match.c3 !== undefined ? match.c3 : '<i class="fa-solid fa-rectangle-xmark"></i>'}</td>
							<td class='${
								match.c10 >= 80
									? match.c10 >= 100
										? 'td-solid-green'
										: 'td-green'
									: match.c10 <= 60
									? 'td-solid-red'
									: 'td-red'
							}'>
							${match.c10 !== undefined ? match.c10 : '<i class="fa-solid fa-rectangle-xmark"></i>'}</td>
							<td>${eloDisplay}</td>
							`;

						mc += 1;

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

						if (match.elo != null && match.elo !== '') {
							totalGame.push(match.elo);
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
						return matchRow;
					});

					// Отображение статистики последней игровой сессии
					const statsDiv = document.getElementById('won-matches');
					const sessionStats = getLastSessionStats();
					const eloGains = matches.reduce((total, match) => {
						const matchDate = new Date(match.date);
						if (lastSessionDate && matchDate.toDateString() === lastSessionDate.toDateString()) {
							if (match.elo !== undefined && previousElo !== null) {
								const eloChange = match.elo - previousElo;
								total += eloChange;
							}
						}
						previousElo = match.elo;
						return total;
					}, 0);
					const eloGainsText =
						eloGains > 0
							? `<p style="padding-left: 10px" class="elo-positive">+${eloGains}</p>`
							: `<p style="padding-left: 10px" class="elo-negative">${eloGains}</p>`;
					statsDiv.innerHTML = `<p>Won matches in the last session: ${sessionStats.wins}/${sessionStats.totalMatches}</p><div style="display: flex">ELO gained in the last session: ${eloGainsText}</div>`;

					rows.reverse().forEach((row) => {
						matchesTableBody.appendChild(row);
					});

					const listGameElo = totalGame;
					const name = matches[0].nickname;
					const adr = totalDamage > 0 ? totalDamage / roundWadr : 'missing';
					const avgKills = totalKills / matches.length;
					const realKD = totalKills / totalDeaths; // K/D
					const headShot = totalHeadShot / matches.length;
					const kpr = totalKills / totalRounds;
					displayEloChart(listGameElo);
					displayAverageStats(
						avgKills,
						realKD,
						matches.length,
						headShot,
						kpr,
						adr,
						rWmatch,
						name,
						currentElo,
					);
				} else {
					console.error('Матчи не найдены или пусты:', data);
				}
			})
			.catch((error) => {
				console.error('Ошибка:', error);
			});
	};

	const displayAverageStats = (
		avgKills,
		realKD,
		matchCount,
		hs,
		kpr,
		adr,
		rW,
		username,
		currentElo,
	) => {
		function getIconLevel(currentElo) {
			if (currentElo <= 500) {
				return 1;
			} else if (currentElo <= 750) {
				return 2;
			} else if (currentElo <= 900) {
				return 3;
			} else if (currentElo <= 1050) {
				return 4;
			} else if (currentElo <= 1200) {
				return 5;
			} else if (currentElo <= 1350) {
				return 6;
			} else if (currentElo <= 1530) {
				return 7;
			} else if (currentElo <= 1750) {
				return 8;
			} else if (currentElo <= 2000) {
				return 9;
			} else {
				return 10;
			}
		}

		const avgKillsDiv = document.getElementById('average-kills');
		avgKillsDiv.innerHTML = `
					<h1 class="username">${username}</h1>
					<div class="elo-container">
							<h2>Current ELO: ${currentElo}</h2>
							<div class="current-elo">
									<img class="iconLevel" src="https://cdn-frontend.faceit-cdn.net/web/static/media/assets_images_skill-icons_skill_level_${getIconLevel(
										currentElo,
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

	// All Games
	const displayEloChart = (listElo) => {
		const ctx = document.getElementById('eloChart').getContext('2d');

		// Находим минимальное и максимальное значения ELO
		const minElo = Math.min(...listElo);
		const maxElo = Math.max(...listElo);

		// Определяем минимальное и максимальное значение для оси Y
		const minYAxis = Math.floor(minElo / 100) * 100;
		const maxYAxis = Math.ceil(maxElo / 100) * 100;

		if (eloChart) {
			eloChart.destroy();
		}

		eloChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: listElo.map((_, index) => `${listElo.length - index}`).reverse(), // Метки для оси X (индексы матчей)
				datasets: [
					{
						label: 'ELO',
						data: listElo.slice(), // Данные для графика (значения ELO)
						borderColor: 'red',
						backgroundColor: 'red',
						borderWidth: 2,
						fill: false,
						pointHoverBackgroundColor: 'white',
						pointRadius: 5,
						pointHoverRadius: 10,
						hitRadius: 20,
						hoverBorderWidth: 3,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				hover: {
					mode: 'nearest',
					intersect: false,
				},
				scales: {
					y: {
						beginAtZero: false,
						min: minYAxis,
						max: maxYAxis,
						ticks: {
							stepSize: 200, // Шаг для меток на оси Y
						},
					},
					x: {
						beginAtZero: true,
					},
				},
				plugins: {
					legend: {
						display: false, // Убираем легенду
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								return `Elo: ${context.raw}`;
							},
						},
					},
				},
			},
		});
	};

	// ----

	document.getElementById('fetchStats').addEventListener('click', fetchStats);

	document.getElementById('username').addEventListener('keypress', (event) => {
		if (event.key === 'Enter') {
			fetchStats();
			document.getElementById('main-c').style.display = 'block';
			document.getElementById('title-All-games').style.display = 'block';
			document.getElementById('title-All-matches').style.display = 'block';
			document.getElementById('title-list-games').style.display = 'block';
		}
	});

	document.getElementById('clearStats').addEventListener('click', () => {
		document.getElementById('main-c').style.display = 'none';
		document.getElementById('won-matches').innerHTML = '';
		document.getElementById('user-back').style.backgroundImage = '';
		document.getElementById('matches').innerHTML = '';
		document.getElementById('title-All-matches').style.display = 'none';
		document.getElementById('username').value = '';
		document.getElementById('avatar').style.display = 'none';
		document.getElementById('country').textContent = '';
		document.getElementById('country-icon').className = '';
		document.getElementById('games').innerHTML = '';
		document.getElementById('average-kills').style.display = 'none';
		document.getElementById('title-All-games').style.display = 'none';
		document.getElementById('title-list-games').style.display = 'none';
		if (eloChart) {
			eloChart.destroy();
		}
	});
});
