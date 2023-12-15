import { Text } from '@mantine/core';
import React from 'react';

interface SectionTitleProps {
	children?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
	return (
		<Text weight={500} size={'sm'}>
			{children}
		</Text>
	);
};

export default SectionTitle;
