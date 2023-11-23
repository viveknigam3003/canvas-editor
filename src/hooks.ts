import { createStyles } from '@mantine/core';
import { useState } from 'react';

export const useModalStyles = createStyles(theme => ({
	content: {
		width: 400,
		padding: '1rem 0.5rem',
	},
	title: {
		fontWeight: 700,
		fontSize: 18,
		color: theme.colors.gray[8],
	},
	label: {
		color: theme.colors.gray[7],
		paddingBottom: '0.25rem',
	},
}));

const getQuery = () => {
	if (typeof window !== 'undefined') {
		return new URLSearchParams(window.location.search);
	}
	return new URLSearchParams();
};

const getQueryStringVal = (key: string): string | null => {
	return getQuery().get(key);
};

export const useQueryParam = (key: string, defaultVal: string): [string, (val: string) => void] => {
	const [query, setQuery] = useState(getQueryStringVal(key) || defaultVal);

	const updateUrl = (newVal: string) => {
		setQuery(newVal);

		const query = getQuery();

		if (newVal.trim() !== '') {
			query.set(key, newVal);
		} else {
			query.delete(key);
		}

		if (typeof window !== 'undefined') {
			const { protocol, pathname, host } = window.location;
			const newUrl = `${protocol}//${host}${pathname}?${query.toString()}`;
			window.history.pushState({}, '', newUrl);
		}
	};

	return [query, updateUrl];
};
