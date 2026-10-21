'use client';

import { useEffect, useMemo, useState } from 'react';
import useGetCustomers, { CUSTOMERS_PAGE_SIZE } from '@/api/user/get-customers';
import { StoreCustomersView } from '@/sections/store-customers/StoreCustomersView';
import { mapApiCustomer } from '@/sections/store-customers/mapper';
import { Customer } from '@/sections/store-customers/types';

export default function Page() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  // The backend has no endpoint to edit another user, so edits and additions stay local to this session.
  const [edited, setEdited] = useState<Record<string, Customer>>({});
  const [added, setAdded] = useState<Customer[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const { data, isLoading, isError } = useGetCustomers(page, debouncedKeyword);

  const customers = useMemo(() => {
    const fetched = (data?.customers ?? []).map((user) => {
      const customer = mapApiCustomer(user);
      return edited[customer.id] ?? customer;
    });
    return page === 1 && !debouncedKeyword ? [...added, ...fetched] : fetched;
  }, [data, edited, added, page, debouncedKeyword]);

  return (
    <StoreCustomersView
      customers={customers}
      totalItems={(data?.totalItems ?? 0) + (debouncedKeyword ? 0 : added.length)}
      page={page}
      pageSize={CUSTOMERS_PAGE_SIZE}
      isLoading={isLoading}
      isError={isError}
      onPageChange={setPage}
      onSearchChange={setKeyword}
      onUpdateCustomer={(updated) => {
        if (added.some((c) => c.id === updated.id)) {
          setAdded((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        } else {
          setEdited((prev) => ({ ...prev, [updated.id]: updated }));
        }
      }}
      onAddCustomer={(customer) => setAdded((prev) => [customer, ...prev])}
    />
  );
}
