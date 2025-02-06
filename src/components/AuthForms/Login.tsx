import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import React from 'react'
import { Link } from 'react-router-dom'

interface IAuthForm {
  onSubmit: (values: { email: string; password: string }) => void;
  loading?: boolean;
}

export const LoginForm: React.FC<IAuthForm> = ({ onSubmit, loading }) => {
  return (
    <form
      className={cn('space-y-5 w-full max-w-2xl mx-auto')}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = form.email.value;
        const password = form.password.value;
        onSubmit({ email, password });
      }}
    >
      <div className="grid gap-8">
        <div className="grid gap-3">
          <Label className="focus:outline-none focus:ring-0" htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full focus:outline-none focus:ring-0"
          />
        </div>
        <div className="grid gap-3">
          <Label className="focus:outline-none focus:ring-0" htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            className="w-full focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Cargando...' : 'Ingresar'}
      </Button>
      <Link to="/password-recovery" className="grid text-sm text-black underline focus:outline-none focus:ring-0">
        ¿Olvidaste tu contraseña?
      </Link>
    </form>
  );
};
