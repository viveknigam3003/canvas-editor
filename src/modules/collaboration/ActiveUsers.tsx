import { Avatar } from '@mantine/core';
import React from 'react';
import { useSelector } from 'react-redux';

interface ActiveUsersProps {}

const ActiveUsers: React.FC<ActiveUsersProps> = () => {
	const others = useSelector((state: any) => state.liveblocks.others);

	return (
		<Avatar.Group spacing="sm">
			<Avatar size={'md'} color="red" radius="xl">
				V
			</Avatar>
			{others.map((user: any) => (
				<Avatar size={'md'} radius="xl" color="blue" key={user.connectionId}>
					A
				</Avatar>
			))}
		</Avatar.Group>
	);
};

export default ActiveUsers;
