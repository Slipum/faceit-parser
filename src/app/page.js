'use client';

import { Header, Main } from '@/components/shared';

import { useState } from 'react';

export default function Home() {
	const [userData, setUserData] = useState(null);

	const fetchUserData = async (username) => {
		if (!username) {
			setUserData(null);
			return;
		}

		try {
			const res = await fetch(
				`/api/proxy?url=https://www.faceit.com/api/users/v1/nicknames/${username}`,
			);
			if (!res.ok) throw new Error('Failed to fetch user data.');
			const data = await res.json();
			setUserData(data.payload);
		} catch (error) {
			console.error('Error fetching user data:', error);
			setUserData(null);
		}
	};

	return (
		<>
			<Header onSearch={fetchUserData} />
			<Main userData={userData} />
		</>
	);
}
