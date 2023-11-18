import Div from '../../components/common/Div';
import FriendsList from './FriendList';

export default function Sidebar() {
  return (
    <Div className="z-10 fixed h-screen w-1/4 top-0 right-0 overflow-x bg-gray-500 rounded-sm shadow-2xl">
      <FriendsList />
    </Div>
  );
}
