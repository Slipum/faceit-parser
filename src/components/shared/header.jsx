'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export const Header = ({ onSearch }) => {
	const [username, setUsername] = useState('');

	const handleSearch = () => {
		if (username.trim()) {
			onSearch(username);
		} else {
			alert('Please, enter a username.');
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const clearSearch = () => {
		setUsername('');
		onSearch('');
	};

	return (
		<header className="header-container">
			<div className="h-logo">
				<Link href="/" style={{ display: 'flex' }}>
					<h1>
						<i className="fa-solid fa-chart-simple"></i> Faceit-Parser
					</h1>
					<p style={{ fontSize: '24px', padding: '10px 20px', fontWeight: '700' }}>for</p>
					<Image
						src="https://distribution.faceit-cdn.net/images/37c4c8fa-31a2-4a81-8654-cf133ec29856.svg"
						alt="CS2"
						width={50}
						height={50}
					/>
				</Link>
			</div>
			<div className="search-wrapper">
				<div className="search-container">
					<div className="find-container">
						<i className="fa-solid fa-magnifying-glass"></i>
					</div>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Enter Faceit username"
						autoComplete="off"
						onKeyDown={handleKeyPress}
					/>
					<button id="clearStats" onClick={clearSearch}>
						<i className="fa-regular fa-circle-xmark"></i>
					</button>
				</div>
			</div>
			<div className="h-auth">
				<a className="github" href="https://github.com/Slipum/faceit-parser">
					<i className="fa-brands fa-github"></i>
				</a>
			</div>
		</header>
	);
};
