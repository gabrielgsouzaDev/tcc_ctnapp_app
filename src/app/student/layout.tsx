import type { ReactNode } from 'react';
import { AppLayout } from '@/components/shared/app-layout';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <AppLayout userType="student">{children}</AppLayout>;
}
