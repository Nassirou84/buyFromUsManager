import { Setting } from '@/types/setting';

export interface SettingDefinition {
  name: string;
  labelKey: string;
  descriptionKey: string;
  scope: Setting['scope'];
  // When set, the value must be one of these. Otherwise it is free text.
  acceptedValues?: readonly string[];
}

export const SETTING_DEFINITIONS: readonly SettingDefinition[] = [
  {
    name: 'base_currency',
    labelKey: 'base_currency',
    descriptionKey: 'setting_def_base_currency_desc',
    scope: 'global',
    acceptedValues: ['FCFA', 'GNF'],
  },
  {
    name: 'welcome_promo_code',
    labelKey: 'setting_def_welcome_promo_code',
    descriptionKey: 'setting_def_welcome_promo_code_desc',
    scope: 'global',
  },
];

export const findSettingDefinition = (name: string) =>
  SETTING_DEFINITIONS.find((definition) => definition.name === name);
