import { useState } from 'react';
import Center from '../../components/position/Center';

import { Button, Card, CardBody, CardFooter, CardHeader, Input, Typography } from '@material-tailwind/react';

const initForm = {
  username: '',
  password: '',
};

export default function LoginView() {
  const [form, setForm] = useState(initForm);

  return (
    <Center className="h-screen w-screen">
      <Card className="w-96 h-max">
        <CardHeader variant="gradient" color="gray" className="mb-4 grid h-28 place-items-center">
          <Typography variant="h3" color="white">
            Sign In
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Input label="Email" size="lg" />
          <Input label="Password" size="lg" />
        </CardBody>
        <CardFooter className="pt-0">
          <Button variant="gradient" fullWidth>
            Sign In
          </Button>
          <Typography variant="small" className="mt-6 flex justify-center">
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
