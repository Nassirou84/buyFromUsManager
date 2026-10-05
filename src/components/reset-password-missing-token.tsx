"use client";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './ui/empty'
import { FerrisWheel } from 'lucide-react'
import Link from 'next/link'
import useLocales from '@/locales/use-locales';

export default function ResetPasswordMissingToken() {

  const { t } = useLocales();

  return (
    <Empty className="h-full bg-muted/30">
      <EmptyHeader>
        <EmptyMedia className="bg-white" variant="icon">
          <FerrisWheel />
        </EmptyMedia>
        <EmptyTitle>{t('missingTokenTitle')}</EmptyTitle>
        <EmptyDescription className="max-w-sm text-pretty">
          {t('missingTokenDescription')}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/auth/forgot-password" className="text-sm text-primary-first hover:underline">
          <button
            type="submit"
            className="w-[240px] h-11 bg-primary-first text-on-primary rounded-lg font-sans text-sm font-bold tracking-wider hover:bg-primary-first/90 transition-all text-white"
          >
            {t('request_new_link')}
          </button>
        </Link>
      </EmptyContent>
    </Empty>
  )
}