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

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S{12,72}$/;

const getRegisterSchema = (t: any) => z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, t('auth.fullNameMin'))
      .max(150, t('auth.fullNameMax')),
    email: z.string().trim().email(t('auth.emailInvalid')),
    phone: z
      .string()
      .trim()
      .regex(/^(\+84|0)\d{9,10}$/, t('auth.phoneInvalid'))
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .regex(
        strongPasswordRegex,
        t('auth.passwordStrong'),
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordMismatch'),
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<ReturnType<typeof getRegisterSchema>>;
        
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

function RegisterContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`;
  const { setAuth } = useAuthStore();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(getRegisterSchema(t)),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await authApi.register({
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken);
      setCookie('accessToken', accessToken, { maxAge: 7 * 86400 });
      setCookie('refreshToken', refreshToken, { maxAge: 30 * 86400 });

      toast.success(t('auth.registerSuccess'));
      router.push(redirect);
    } catch (error: any) {
      toast.error(getErrorMessage(error, t('auth.registerFailed')));
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
            <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">{t('auth.registerTitle')}</h1>
            <p className="mb-6 text-sm text-gray-500">{t('auth.registerSubtitle')}</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">{t('auth.fullName')}</label>
                <input
                  {...form.register('fullName')}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className={`input ${form.formState.errors.fullName ? 'input-error' : ''}`}
                />
                {form.formState.errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.fullName.message}</p>
                )}
              </div>

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
                <label className="label">{t('auth.phone')}</label>
                <input
                  {...form.register('phone')}
                  autoComplete="tel"
                  placeholder={t('auth.phonePlaceholder')}
                  className={`input ${form.formState.errors.phone ? 'input-error' : ''}`}
                />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('auth.password')}</label>
                <PasswordInput
                  {...form.register('password')}
                  autoComplete="new-password"
                  placeholder={t('auth.passwordPlaceholder')}
                />
                {form.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="label">{t('auth.confirmPassword')}</label>
                <PasswordInput
                  {...form.register('confirmPassword')}
                  autoComplete="new-password"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {form.formState.errors.confirmPassword.message}
                  </p>
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
                  t('auth.registerButton')
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href={loginHref} className="font-medium text-primary-600 hover:underline">
                {t('auth.loginLink')}
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

export default function RegisterPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="p-6 text-center">{t('common.loading')}</div>}>
      <RegisterContent />
    </Suspense>
  );
}
