import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Input } from '@/components/ui/input';
import { ProductDetail } from '../../types';
import { ADD_LINK_CLASS, EMPTY_CLASS, REMOVE_BTN_CLASS, SECTION_CLASS, SECTION_TITLE_CLASS } from './constants';

interface DetailsSectionProps {
  details: ProductDetail[];
  onChange: (details: ProductDetail[]) => void;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({ details, onChange }) => {
  const { t } = useLocales();

  const update = (i: number, patch: Partial<ProductDetail>) =>
    onChange(details.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  return (
    <section className={SECTION_CLASS}>
      <div className="flex items-center justify-between">
        <span className={SECTION_TITLE_CLASS}>{t('product_details')}</span>
        <button
          type="button"
          onClick={() => onChange([...details, { name: '', value: '' }])}
          className={ADD_LINK_CLASS}
        >
          + {t('add_detail')}
        </button>
      </div>
      {details.length === 0 && <p className={EMPTY_CLASS}>{t('no_details_yet')}</p>}
      {details.map((d, i) => (
        <div key={i} className="flex items-start gap-2">
          <Input
            containerClassName="flex-1 mb-0"
            aria-label={t('detail_label')}
            placeholder={t('detail_label')}
            value={d.name}
            onChange={(e) => update(i, { name: e.target.value })}
          />
          <Input
            containerClassName="flex-1 mb-0"
            aria-label={t('detail_value')}
            placeholder={t('detail_value')}
            value={d.value}
            onChange={(e) => update(i, { value: e.target.value })}
          />
          <button
            type="button"
            aria-label={t('remove')}
            onClick={() => onChange(details.filter((_, idx) => idx !== i))}
            className={REMOVE_BTN_CLASS}
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      ))}
    </section>
  );
};
