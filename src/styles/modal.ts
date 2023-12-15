import { createStyles } from '@mantine/core';

export const useModalStyles = createStyles(theme => ({
	content: {
		width: 400,
		padding: '1rem 0.5rem',
	},
	title: {
		fontWeight: 700,
		fontSize: 18,
		color: theme.colorScheme === 'dark' ? theme.colors.gray[1] : theme.colors.gray[8],
	},
	label: {
		color: theme.colors.gray[7],
		paddingBottom: '0.25rem',
	},
	subtext: {
		color: theme.colors.gray[6],
	},
}));
