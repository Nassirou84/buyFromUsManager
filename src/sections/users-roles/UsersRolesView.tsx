'use client';
import useLocales from '@/locales/use-locales';
import React from 'react';
import { AddUserModal, NewUserPayload } from './modals/AddUserModal';
import useCreateNewAdmin from '@/api/user/create-new-admin';
import { toast } from 'sonner';
import useGetAdminUsers from '@/api/user/get-admin-users';
import User from '@/types/user';
import useToggleAdminAccess from '@/api/user/toggle-admin-access';
import { ADMIN_USERS_QUERY_KEY } from '@/api/user/get-admin-users';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useIsSuperAdmin } from '@/auth/hooks';
import useResetPasswordRequest from '@/api/user/reset-password-request';
import { Icon } from '@/components/lucide-icon';
import Moment from 'moment';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';

// Highest rank first. The first match in a user's roles is shown as the tag.
const ROLE_HIERARCHY: { role: string; labelKey: string }[] = [
  { role: 'ROLE_SUPER_ADMIN', labelKey: 'role_tag_super_admin' },
  { role: 'ROLE_ADMIN', labelKey: 'role_tag_admin' },
  { role: 'ROLE_MARKETING', labelKey: 'role_tag_marketing' },
  { role: 'ROLE_ACCOUNTING', labelKey: 'role_tag_accountant' },
  { role: 'ROLE_COURRIER', labelKey: 'role_tag_courrier' },
  { role: 'ROLE_USER', labelKey: 'role_tag_user' },
];

const getTopRoleLabelKey = (roles: string[] = []) =>
  ROLE_HIERARCHY.find(({ role }) => roles.includes(role))?.labelKey;

// Must match the page size used by the backend (UserService::queryAdminUsers).
const ITEMS_PER_PAGE = 10;

// Page numbers with ellipsis: first, last, and a window around the current page
const getPageItems = (currentPage: number, totalPages: number) => {
  const pageItems: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageItems.push(i);
  } else {
    const start = Math.max(2, Math.min(currentPage - 1, totalPages - 4));
    const end = Math.min(totalPages - 1, Math.max(currentPage + 1, 5));
    pageItems.push(1);
    if (start > 2) pageItems.push('ellipsis-start');
    for (let i = start; i <= end; i++) pageItems.push(i);
    if (end < totalPages - 1) pageItems.push('ellipsis-end');
    pageItems.push(totalPages);
  }
  return pageItems;
};

export const UsersRolesView: React.FC = () => {

  const { t } = useLocales();
  const { mutateAsync: createNewAdmin } = useCreateNewAdmin();
  const { mutate: toggleAdminAccess, variables: pendingAdminId, isPending: isUpdatingAccess } = useToggleAdminAccess();
  const { mutate: resetPassword, variables: resettingAdminId, isPending: isResettingPassword } = useResetPasswordRequest();
  const queryClient = useQueryClient();

  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search.trim(), 500);

  const router = useRouter();
  const isSuperAdmin = useIsSuperAdmin();

  const { data: admins, isLoading } = useGetAdminUsers(currentPage, debouncedSearch, isSuperAdmin);

  const totalCount: number = admins?.all ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  // Fall back to the last page if the current one no longer exists (e.g. after the total shrinks)
  React.useEffect(() => {
    if (admins && currentPage > totalPages) setCurrentPage(totalPages);
  }, [admins, currentPage, totalPages]);

  // A new search starts from the first page
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (!isSuperAdmin) router.replace('/');
  }, [isSuperAdmin, router]);

  const handleClickInvite = () => {
    setIsInviteModalOpen(true);
  };

  const handleAddUser = (data: NewUserPayload) => {
    createNewAdmin(data).then(() => {
      toast.success(t('user_created_successfully'));
      setIsInviteModalOpen(false);
    }).catch((error: unknown) => {
      const message = (error as { error?: string })?.error ?? 'user_creation_failed';
      toast.error(t(message));
    });
  }

  const handleToggleAccess = (admin: User) => {
    toggleAdminAccess(admin.id, {
      onSuccess: (data) => {
        queryClient.setQueriesData<{ users: User[] }>({ queryKey: ADMIN_USERS_QUERY_KEY }, (old) =>
          old && {
            ...old,
            users: old.users.map((u) => u.id === data.id ? { ...u, isGrantedAccess: data.isGrantedAccess } : u),
          },
        );
        queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
        toast.success(t('admin_access_updated'));
      },
      onError: (error: unknown) => {
        const key = (error as { error?: string })?.error;
        toast.error(t(key === 'cannot_toggle_self' || key === 'admin_not_found' || key === 'not_super_admin' ? key : 'admin_access_update_failed'));
      },
    });
  };

  const handleResetPassword = (admin: User) => {
    resetPassword(admin.id, {
      onSuccess: () => toast.success(t('reset_password_email_sent', { email: admin.email })),
      onError: () => toast.error(t('an_error_occurred_while_sending_the_reset_password_email')),
    });
  };

  if (!isSuperAdmin) return null;

  return (
    <div className="flex flex-col gap-5">

      {isInviteModalOpen && (
        <AddUserModal
          onSubmit={handleAddUser}
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      <div>
        <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
          {t('admin_access_control')}
        </div>
        <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
          {t('users_roles_title')}
        </h1>
        <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
          {t('users_subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#eff4ff]/60 border-b border-[#e5eeff] flex justify-between items-center">
          <span className="font-bold text-sm text-[#0b1c30]">{t('admin_team_roster', { count: totalCount })}</span>
          <button onClick={handleClickInvite} className="px-3 py-1.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg">
            {t('invite_operator')}
          </button>
        </div>
        <div className="p-4 border-b border-[#e5eeff] dark:border-slate-800">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin_search_placeholder')}
            leftIcon={<Icon name="search" className="text-[18px]" />}
            containerClassName="mb-0 max-w-md"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff4ff]/70 dark:bg-slate-800/60 border-b border-[#e5eeff] dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-[#565e74] dark:text-slate-400">
                <th className="py-3 px-4">{t('admin_column_user')}</th>
                <th className="py-3 px-4">{t('admin_column_created_at')}</th>
                <th className="py-3 px-4 text-center">{t('admin_column_access')}</th>
                <th className="py-3 px-4 text-right">{t('admin_column_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-3.5 w-40" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-3.5 w-28" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-5 w-9 rounded-full mx-auto" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-7 w-32 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))}
              {!isLoading && admins?.users?.map((admin: User) => (
                <tr key={admin.id} className="hover:bg-[#eff4ff]/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#004ac6] text-white font-bold flex items-center justify-center shrink-0">
                        {admin.firstName?.[0]}{admin.lastName?.[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {admin.firstName} {admin.lastName}
                          {getTopRoleLabelKey(admin.roles) && (
                            <span className="text-[#004ac6] dark:text-blue-400"> [{t(getTopRoleLabelKey(admin.roles)!)}]</span>
                          )}
                        </span>
                        <span className="text-slate-500">{admin.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {admin.createdAt ? Moment(admin.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={admin.isGrantedAccess === true}
                      aria-label={t('toggle_admin_access')}
                      disabled={isUpdatingAccess && pendingAdminId === admin.id}
                      onClick={() => handleToggleAccess(admin)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${admin.isGrantedAccess === true ? 'bg-[#004ac6]' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${admin.isGrantedAccess === true ? 'translate-x-[18px]' : 'translate-x-0.5'
                          }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      title={t('reset_password')}
                      aria-label={t('reset_password')}
                      disabled={isResettingPassword && resettingAdminId === admin.id}
                      onClick={() => handleResetPassword(admin)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e5eeff] dark:border-slate-700 text-[#004ac6] dark:text-blue-400 font-semibold hover:bg-[#eff4ff] dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                      <Icon name="lock_reset" className="text-[14px]" />
                      {t('reset_password')}
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && admins?.users?.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-slate-500">
                    {t('admin_search_no_results', { search: debouncedSearch })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#eff4ff]/40 dark:bg-slate-800/40 border-t border-[#e5eeff] dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]">
          <div className="text-[#565e74] dark:text-slate-400 whitespace-nowrap">
            {t('showing')} <span className="font-semibold text-[#0b1c30] dark:text-white">{rangeStart} - {rangeEnd}</span> {t('of')}{' '}
            <span className="font-semibold text-[#0b1c30] dark:text-white">{totalCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-[#eff4ff]"
            >
              <Icon name="chevron_left" className="text-[16px]" />
            </button>
            {getPageItems(currentPage, totalPages).map((item) =>
              typeof item === 'number' ? (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrentPage(item)}
                  className={
                    item === currentPage
                      ? 'w-7 h-7 rounded bg-[#004ac6] text-white font-bold text-[12px] flex items-center justify-center shadow-xs'
                      : 'w-7 h-7 rounded bg-white dark:bg-slate-800 border border-[#c3c6d7] dark:border-slate-700 hover:bg-[#eff4ff] text-[#0b1c30] dark:text-white text-[12px] flex items-center justify-center'
                  }
                >
                  {item}
                </button>
              ) : (
                <span key={item} className="text-[#737686]">...</span>
              )
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 rounded border border-[#c3c6d7] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-[#eff4ff]"
            >
              <Icon name="chevron_right" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
