'use client';

import { useState } from 'react';
import { StoreCustomersView } from '@/sections/store-customers/StoreCustomersView';
import { INITIAL_CUSTOMERS } from '@/sections/store-customers/mockData';
import { Customer } from '@/sections/store-customers/types';

export default function Page() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  return (
    <StoreCustomersView
      customers={customers}
      onUpdateCustomer={(updated) => setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))}
      onAddCustomer={(customer) => setCustomers((prev) => [customer, ...prev])}
    />
  );
}
