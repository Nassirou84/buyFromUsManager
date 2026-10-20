import useLocales from '@/locales/use-locales';
import React from 'react';
import { Bus, CircleHelp, Cloud, ExternalLink, GalleryHorizontal, Package, PanelLeftClose, PanelLeftOpen, Settings, Tag, Truck, Undo2, UserCog, Users } from "lucide-react";
import Link from 'next/link';
import { useIsSuperAdmin } from '@/auth/hooks';
import LanguagePoppever from './language-poppever';

export type NavigationPath =
  | 'catalog-scraping'
  | 'orders-fulfillment'
  | 'returns-rmas'
  | 'delivery-fleet'
  | 'store-customers'
  | 'promotions-coupons'
  | 'banners-merchandising'
  | 'faqs'
  | 'users-roles'
  | 'platform-settings';

export const NAV_HREFS: Record<NavigationPath, string> = {
  'catalog-scraping': '/dashboard',
  'orders-fulfillment': '/dashboard/orders-fulfillment',
  'returns-rmas': '/dashboard/returns-rmas',
  'delivery-fleet': '/dashboard/delivery-fleet',
  'store-customers': '/dashboard/store-customers',
  'promotions-coupons': '/dashboard/promotions-coupons',
  'banners-merchandising': '/dashboard/banners-merchandising',
  'faqs': '/dashboard/faqs',
  'users-roles': '/dashboard/users-roles',
  'platform-settings': '/dashboard/platform-settings',
};

export const pathToNavigationPath = (pathname: string): NavigationPath =>
  (Object.keys(NAV_HREFS) as NavigationPath[]).find(
    (key) => key !== 'catalog-scraping' && pathname.startsWith(NAV_HREFS[key])
  ) ?? 'catalog-scraping';

const NAV_SECTIONS: {
  titleKey: string;
  items: { key: NavigationPath; labelKey: string; icon: React.ElementType; badge?: string; superAdminOnly?: boolean }[];
}[] = [
  {
    titleKey: 'nav_operations',
    items: [
      { key: 'catalog-scraping', labelKey: 'nav_catalog_scraping', icon: Package },
      { key: 'orders-fulfillment', labelKey: 'nav_orders_fulfillment', icon: Truck, badge: '19' },
      { key: 'returns-rmas', labelKey: 'nav_returns_rmas', icon: Undo2 },
      { key: 'delivery-fleet', labelKey: 'nav_delivery_fleet', icon: Bus },
      { key: 'store-customers', labelKey: 'nav_store_customers', icon: Users },
    ],
  },
  {
    titleKey: 'nav_marketing_growth',
    items: [
      { key: 'promotions-coupons', labelKey: 'nav_promotions_coupons', icon: Tag },
      { key: 'banners-merchandising', labelKey: 'nav_banners_merchandising', icon: GalleryHorizontal },
      { key: 'faqs', labelKey: 'nav_faqs', icon: CircleHelp },
    ],
  },
  {
    titleKey: 'nav_administration',
    items: [
      { key: 'users-roles', labelKey: 'nav_users_roles', icon: UserCog, superAdminOnly: true },
      { key: 'platform-settings', labelKey: 'nav_platform_settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  currentPath: NavigationPath;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  collapsed,
  onToggleCollapse,
}) => {
  const { t } = useLocales();
  const isSuperAdmin = useIsSuperAdmin();

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${collapsed ? 'w-20' : 'w-72'
        } bg-white dark:bg-[#131b2e] border-r border-[#e5eeff] dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none transition-all duration-300`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header Branding */}
        <div className={`p-5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} border-b border-[#f0f4ff] dark:border-slate-800`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              F
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-[17px] text-[#0b1c30] dark:text-white tracking-tight leading-tight">
                  Flot Boutique
                </span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400 font-medium">
                  {t('admin_workspace')}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <span className="px-2 py-0.5 bg-[#dae2fd] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 font-semibold text-[11px] rounded uppercase tracking-wider">
              v2.4
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 flex flex-col gap-1">
          {NAV_SECTIONS.map((section) => ({
            ...section,
            items: section.items.filter((item) => !item.superAdminOnly || isSuperAdmin),
          })).filter((section) => section.items.length > 0).map((section, i) => (
            <React.Fragment key={section.titleKey}>
              {!collapsed && (
                <div className={`px-3 ${i === 0 ? 'pt-3' : 'pt-4'} pb-1 text-[11px] uppercase tracking-wider text-[#565e74] dark:text-slate-400 font-bold`}>
                  {t(section.titleKey)}
                </div>
              )}
              {section.items.map(({ key, labelKey, icon: ItemIcon, badge }) => (
                <Link
                  key={key}
                  href={NAV_HREFS[key]}
                  title={t(labelKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${currentPath === key
                    ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                    : 'text-[#434655] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800 hover:text-[#0b1c30]'
                    } ${collapsed ? 'justify-center' : ''}`}
                >
                  <ItemIcon size={20} />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>{t(labelKey)}</span>
                      {badge && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#ffdbcd] text-[#943700] rounded font-bold">
                          {badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-3 border-t border-[#f0f4ff] dark:border-slate-800 bg-white dark:bg-[#131b2e] flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 py-2 bg-[#eff4ff] dark:bg-slate-800/80 rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#004ac6] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#004ac6]"></span>
            </span>
            {!collapsed && (
              <span className="text-[11.5px] font-medium text-[#0b1c30] dark:text-slate-200 truncate">
                {t('scrapers_active_nodes', { count: 4 })}
              </span>
            )}
          </div>
          <Cloud size={16} className="text-[#737686] flex-shrink-0" />
        </div>

        {/* Header actions, shown here instead of in the header on narrow screens */}
        <div className={`lg:hidden flex items-center ${collapsed ? 'flex-col gap-1' : 'justify-between'} px-1`}>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={process.env.NEXT_PUBLIC_STORE_FRONT_URL || '#'}
            title={t('storefront_preview')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#565e74] dark:text-slate-300 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded text-[12px] font-medium transition-colors"
          >
            <ExternalLink size={17} />
            {!collapsed && <span>{t('storefront_preview')}</span>}
          </Link>
          <LanguagePoppever />
        </div>

        <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'justify-between'} px-1 pt-1`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? t('expand_sidebar') : t('collapse_sidebar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#565e74] dark:text-slate-300 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded text-[12px] font-medium transition-colors"
          >
            {collapsed ? <PanelLeftOpen size={17} className="" /> : <PanelLeftClose size={17} className="" />}
            {!collapsed && <span>{t('collapse')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
