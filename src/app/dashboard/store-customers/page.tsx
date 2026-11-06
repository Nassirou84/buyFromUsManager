'use client';

import { useEffect, useMemo, useState } from 'react';
import useGetCustomers, { CUSTOMERS_PAGE_SIZE } from '@/api/user/get-customers';
import { StoreCustomersView } from '@/sections/store-customers/StoreCustomersView';
import { mapApiCustomer } from '@/sections/store-customers/mapper';

export default function Page() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [onlyNew, setOnlyNew] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const { data, isLoading, isError } = useGetCustomers(page, debouncedKeyword, onlyNew);

  const customers = useMemo(() => (data?.customers ?? []).map(mapApiCustomer), [data]);

  const handleStatusChange = (status: 'all' | 'new') => {
    setOnlyNew(status === 'new');
    setPage(1);
  };

  return (
    <StoreCustomersView
      customers={customers}
      totalItems={data?.totalItems ?? 0}
      page={page}
      pageSize={CUSTOMERS_PAGE_SIZE}
      isLoading={isLoading}
      isError={isError}
      onPageChange={setPage}
      onSearchChange={setKeyword}
      onStatusChange={handleStatusChange}
    />
  );
}
