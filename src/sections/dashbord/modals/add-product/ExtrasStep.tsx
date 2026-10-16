import React from 'react';
import useLocales from '@/locales/use-locales';
import { DetailsSection } from './DetailsSection';
import { FeaturesSection } from './FeaturesSection';
import { StepFooter } from './StepFooter';
import { VariantsSection } from './VariantsSection';
import { ProductFormValues, SetField } from './use-product-form';

interface ExtrasStepProps {
  values: ProductFormValues;
  setField: SetField;
  onBack: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ExtrasStep: React.FC<ExtrasStepProps> = ({ values, setField, onBack, onSave, onCancel }) => {
  const { t } = useLocales();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: product details & features */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <DetailsSection details={values.details} onChange={(v) => setField('details', v)} />
          <FeaturesSection features={values.features} onChange={(v) => setField('features', v)} />
        </div>

        {/* Right: variants manager */}
        <VariantsSection
          className="lg:col-span-6"
          variants={values.variants}
          defaultPrice={values.retailPrice}
          onChange={(v) => setField('variants', v)}
        />
      </div>

      <StepFooter
        onBack={onBack}
        onCancel={onCancel}
        submitLabel={t('save_publish_to_catalog')}
        submitDisabled={!values.title.trim()}
      />
    </form>
  );
};
