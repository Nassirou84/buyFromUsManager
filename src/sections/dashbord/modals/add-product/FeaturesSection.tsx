import React from 'react';
import useLocales from '@/locales/use-locales';
import { Icon } from '@/components/lucide-icon';
import { Input } from '@/components/ui/input';
import { ADD_LINK_CLASS, EMPTY_CLASS, REMOVE_BTN_CLASS, SECTION_CLASS, SECTION_TITLE_CLASS } from './constants';

interface FeaturesSectionProps {
  features: string[];
  onChange: (features: string[]) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features, onChange }) => {
  const { t } = useLocales();

  return (
    <section className={SECTION_CLASS}>
      <div className="flex items-center justify-between">
        <span className={SECTION_TITLE_CLASS}>{t('product_features')}</span>
        <button type="button" onClick={() => onChange([...features, ''])} className={ADD_LINK_CLASS}>
          + {t('add_feature')}
        </button>
      </div>
      {features.length === 0 && <p className={EMPTY_CLASS}>{t('no_features_yet')}</p>}
      {features.map((f, i) => (
        <div key={i} className="flex items-start gap-2">
          <Input
            containerClassName="flex-1 mb-0"
            aria-label={t('feature')}
            placeholder={t('feature_placeholder')}
            value={f}
            onChange={(e) => onChange(features.map((x, idx) => (idx === i ? e.target.value : x)))}
          />
          <button
            type="button"
            aria-label={t('remove')}
            onClick={() => onChange(features.filter((_, idx) => idx !== i))}
            className={REMOVE_BTN_CLASS}
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      ))}
    </section>
  );
};
