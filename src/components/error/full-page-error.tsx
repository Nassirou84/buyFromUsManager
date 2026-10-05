"use client";
import React from 'react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '../ui/empty'
import useLocales from '@/locales/use-locales';

export default function FullPageError() {
  const { t } = useLocales();
  return (
    <div className="flex items-center justify-center h-screen">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('500_internal_server_error')}</EmptyTitle>
          <EmptyDescription>
            {t('500_description')}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            {t('need_help')} <a href="#">{t('contact_support')}</a>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  )
}