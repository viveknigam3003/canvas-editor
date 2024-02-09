import { useSelector } from 'react-redux';
import Cursor from './Cursor';

const CursorDisplay = () => {
	const otherCursors = useSelector((state: any) =>
		state.liveblocks.others.map((user: any) => user.presence.collaboration.cursor),
	);

	return (
		<>
			{otherCursors.map((cursor: any, index: number) => (
				<Cursor x={cursor.x} y={cursor.y} key={`${index}`} color="blue" />
			))}
		</>
	);
};

export default CursorDisplay;
