import './fabricOverrides.ts';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import ArtboardPage from './Artboard.tsx';
import './index.css';
import store from './store/index.ts';
import ErrorElement from './errors/ErrorElement.tsx';
import ErrorBoundary from './errors/ErrorBoundary.tsx';

const router = createBrowserRouter([
	{
		path: '/',
		element: (
			<ErrorBoundary>
				<App />
			</ErrorBoundary>
		),
		errorElement: <ErrorElement />,
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
