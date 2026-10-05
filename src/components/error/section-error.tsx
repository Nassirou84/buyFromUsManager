"use client";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import useLocales from "@/locales/use-locales";

export default function SectionError() {

  const { t } = useLocales();

  return (
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
  )
}
