import { Box, Button, Center, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconAlertTriangle, IconReload } from '@tabler/icons-react';
import { useRouteError } from 'react-router-dom';

interface ErrorElementProps {
	error?: Error | null;
}

const ErrorElement: React.FC<ErrorElementProps> = ({ error }) => {
	const theme = useMantineTheme();
	const routeError = useRouteError();
	const foundError = error || new Error((routeError as any).error.message);

	return (
		<Center h={'100vh'}>
			<Stack align="center">
				<IconAlertTriangle
					size={72}
					color={theme.colorScheme === 'dark' ? theme.colors.red[5] : theme.colors.red[8]}
				/>
				<Stack spacing={8}>
					<Text size="xl" align="center" weight={500}>
						Seems like something went wrong :(
					</Text>
					<Text size="sm" align="center">
						Try reloading the page or contact support.
					</Text>
					{(foundError as Error) && (
						<Box
							p="lg"
							style={{
								backgroundColor:
									theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.red[0],
							}}
						>
							<Text
								size={13}
								style={{ wordBreak: 'break-word', width: 300 }}
								weight={500}
								color={theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.gray[7]}
							>
								Error:{' '}
								<span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
									{(foundError as Error)?.message}
								</span>
							</Text>
						</Box>
					)}
				</Stack>
				<Button onClick={() => window.location.reload()} variant="subtle" leftIcon={<IconReload size={12} />}>
					Reload
				</Button>
			</Stack>
		</Center>
	);
};

export default ErrorElement;
