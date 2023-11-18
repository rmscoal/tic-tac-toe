import { useEffect, useState } from 'react';

// Components
import Div from '../../components/common/Div';
import { Typography, Button } from '@material-tailwind/react';

// Service
import { friendsAPI } from '../../app/services/api';
import Center from '../../components/position/Center';

export default function FriendsList() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    friendsAPI
      .friendsList()
      .then((data) => {
        setFriends(data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Div className="text-center mt-2 mx-2 p-2 rounded-xl shadow-2xl bg-blue-gray-900">
      <Typography variant="h4" color="white" className="">
        Friends List
      </Typography>
      {friends.length === 0 ? (
        <Center>No friends</Center>
      ) : (
        <Div className="grid grid-flow-row grid-cols-2 items-center">
          {friends.map((friend) => (
            <>
              <Typography variant="paragraph" color="white">{`${friend.username}`}</Typography>
              <Button variant="gradient" fullWidth onClick={() => console.log('Clicked')} type="submit">
                Invite
              </Button>
            </>
          ))}
        </Div>
      )}
    </Div>
  );
}
