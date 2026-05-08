'use client';

import { Suspense, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { setCookie } from 'cookies-next';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useTranslation } from 'react-i18next';

const getLoginSchema = (t: any) => z.object({
  email: z.string().trim().email(t('auth.emailInvalid')),
  password: z.string().min(1, t('auth.passwordRequired')).max(72, t('auth.passwordMin')),
});

type LoginForm = z.infer<ReturnType<typeof getLoginSchema>>;

function getErrorMessage(error: any, fallback: string): string {
  const responseMessage = error?.response?.data?.message;
  if (Array.isArray(responseMessage)) return responseMessage[0] ?? fallback;
  if (typeof responseMessage === 'string') return responseMessage;
  if (typeof error?.message === 'string' && error.message !== 'Network Error') return error.message;
  return fallback;
}

function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className="input pr-10" />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LoginContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const registerHref = `/register?redirect=${encodeURIComponent(redirect)}`;
  const { setAuth } = useAuthStore();

  const form = useForm<LoginForm>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    console.log('SUBMIT', data);
    try {
      const response = await authApi.login(data);
      const { user, accessToken, refreshToken } = response.data.data;

      setAuth(user, accessToken);
      setCookie('accessToken', accessToken, { maxAge: 7 * 86400 });
      setCookie('refreshToken', refreshToken, { maxAge: 30 * 86400 });

      toast.success(`${t('auth.welcomeBack')} ${user.fullName?.split(' ').pop() || ''}`);
      router.push(redirect);
    } catch (error: any) {
      toast.error(getErrorMessage(error, t('auth.loginFailed')));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 p-4">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Tech<span className="text-primary-600">Shop</span>
              </span>
            </Link>
          </div>

          <div className="card p-7">
            <h1 className="mb-1 text-xl font-semibold text-gray-900">{t('auth.loginTitle')}</h1>
            <p className="mb-6 text-sm text-gray-500">{t('auth.loginSubtitle')}</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">{t('auth.email')}</label>
                <input
                  {...form.register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  className={`input ${form.formState.errors.email ? 'input-error' : ''}`}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('auth.password')}</label>
                <PasswordInput
                  {...form.register('password')}
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder')}
                />
                {form.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="btn-primary btn-lg w-full"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('auth.loginButton')
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link href={registerHref} className="font-medium text-primary-600 hover:underline">
                {t('auth.registerLink')}
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/" className="text-primary-600 hover:underline">
              {t('common.viewShop')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
      <LoginContent />
    </Suspense>
  );
}
