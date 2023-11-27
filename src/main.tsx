import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ArtboardPage from './Artboard.tsx';
import store from './store/index.ts';
import { Provider } from 'react-redux';
import { Notifications } from '@mantine/notifications';
import { useLocalStorage } from '@mantine/hooks';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		errorElement: <div>Oops, error occured while loading Media Library</div>,
	},
	{
		path: '/artboard',
		element: <ArtboardPage />,
		errorElement: <div>404 artboard not found</div>,
	},
]);

export const MainWrapper = () => {
	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
		key: 'mantine-color-scheme',
		defaultValue: 'light',
		getInitialValueInEffect: true,
	});

	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	return (
		<React.StrictMode>
			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider
					theme={{
						primaryColor: 'violet',
						colorScheme,
					}}
					withGlobalStyles
					withNormalizeCSS
				>
					<Provider store={store}>
						<RouterProvider router={router} />
						<Notifications position="bottom-center" />
					</Provider>
				</MantineProvider>
			</ColorSchemeProvider>
		</React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(<MainWrapper />);
