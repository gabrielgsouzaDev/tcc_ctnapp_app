import type { ReactNode } from 'react';
import { AppLayout } from '@/app/shared/app-layout';

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return <AppLayout userType="employee">{children}</AppLayout>;
}
