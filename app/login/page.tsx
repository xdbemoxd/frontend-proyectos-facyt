import LoginForm from '@/components/ui/login-form';
import { Suspense } from 'react';

export const metadata = { title: 'Iniciar sesión' };

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
