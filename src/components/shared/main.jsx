import Image from 'next/image';

export const Main = ({ userData }) => {
	if (!userData) {
		return <></>;
	}

	const { avatar, country, cover_image_url } = userData;

	return (
		<div className="main-container">
			<div id="main-c" className="main-info">
				<div
					id="user-back"
					className="user-container"
					style={{
						backgroundImage: cover_image_url ? `url('${cover_image_url}')` : 'none',
						backgroundRepeat: 'no-repeat',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}>
					<div className="overlay"></div>
					<div id="userInfo" className="user-info">
						{avatar && <Image id="avatar" src={avatar} alt="avatar" width={100} height={100} />}
						<div className="avg-container">
							<div id="average-kills" style={{ display: avatar ? 'block' : 'none' }}>
								Avg Kills
							</div>
						</div>
					</div>
				</div>
				<hr />
				{country && (
					<div id="country-list">
						<div className="country-info">
							<i id="country-icon" className={`fi fi-${country.toLowerCase()}`}></i>
							<p id="country">{country.toUpperCase()}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
