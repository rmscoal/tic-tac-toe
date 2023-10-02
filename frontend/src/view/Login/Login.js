import { useState } from 'react';
import BlackBackground from '../../components/body/BlackBackground';
import Center from '../../components/position/Center';

const initForm = {
  username: '',
  password: '',
};

export default function LoginView() {
  const [form, setForm] = useState(initForm);

  return (
    <BlackBackground className="h-screen">
      <Center className="h-full">
        <button value={form.username}>Login</button>
      </Center>
    </BlackBackground>
  );
}
