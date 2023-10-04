import { Navbar, Typography, Button } from '@material-tailwind/react';
import Div from '../../components/common/Div';

import Logo from '../../assets/images/tic-tac-toe.png';
import Center from '../../components/position/Center';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <Div className="h-screen w-screen relative">
      <Button className="absolute top-5 left-3/4" onClick={handleSignIn}>
        Sign In
      </Button>
      <Center className="h-full">
        <Div className="text-center w-80 px-2 py-2 rounded-lg top-0 shadow-xl bg-white animate-wiggle">
          <Center>
            <img src={Logo} alt="Logo" className="w-56" />
          </Center>
          <Typography variant="h2" className="mt-4">
            Tic Tac Online
          </Typography>
        </Div>
      </Center>
    </Div>
  );
}
