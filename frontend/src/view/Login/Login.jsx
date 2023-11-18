import { useState } from 'react';
import { initLoginForm } from './type';

// Services
import { userAPI } from '../../app/services/api';
import { storeUserInformation } from '../../app/storage/local';
import { storeAccessToken } from '../../app/storage/session';

// Components
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Input, Typography } from '@material-tailwind/react';
import Center from '../../components/position/Center';
import Form from '../../components/form/Form';

// Assets
import Logo from '../../assets/images/tic-tac-toe.png';

export default function LoginView() {
  const [form, setForm] = useState(initLoginForm);
  const [err, setErr] = useState('');

  const handleForm = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    userAPI
      .login(form)
      .then((data) => {
        let err;
        err = storeAccessToken(data.data?.accessToken);
        if (err != null) {
          setErr(err.message);
          return;
        }
        err = storeUserInformation({ id: data?.id, username: data?.username });
        if (err != null) {
          setErr(err.message);
        }
      })
      .catch((err) => {
        setErr(err.message);
      });
  };

  return err !== '' ? (
    <Center className="h-screen">
      <Alert className="w-1/2" color="red">{`${err}, please refresh page`}</Alert>
    </Center>
  ) : (
    <Center className="h-screen w-screen">
      <Card className="w-96 h-max">
        <Center>
          <CardHeader variant="gradient" color="white" shadow className="relative h-max w-40">
            <Center>
              <img src={Logo} alt="tic-tac-toe log" className="w-40 h-40" />
            </Center>
          </CardHeader>
        </Center>
        <CardBody className="flex flex-col gap-4">
          <Form onSubmit={handleSubmit}>
            <Center className="flex-col gap-4">
              <Input label="Username" size="lg" onChange={handleForm('username')} />
              <Input label="Password" size="lg" onChange={handleForm('password')} type="password" />
              <Button variant="gradient" fullWidth onClick={handleSubmit} type="submit">
                Sign In
              </Button>
            </Center>
          </Form>
        </CardBody>
        <CardFooter className="pt-0">
          <Typography variant="small" className="mt-2 flex justify-center">
            Don&apos;t have an account?
            <Typography as="a" href="#signup" variant="small" color="blue-gray" className="ml-1 font-bold">
              Sign up
            </Typography>
          </Typography>
        </CardFooter>
      </Card>
    </Center>
  );
}
