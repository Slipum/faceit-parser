import './globals.css';

export const metadata = {
	title: 'Faceit Parser',
	description: 'For Faceit stats',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/css/flag-icons.min.css"
				/>
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
				/>
				<link rel="icon" href="assets/favicon.ico" type="image/x-icon" />
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Faceit User Stats</title>
			</head>
			<body>{children}</body>
		</html>
	);
}
