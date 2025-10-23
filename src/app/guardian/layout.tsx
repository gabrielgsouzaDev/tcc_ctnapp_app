import type { ReactNode } from 'react';
import { AppLayout } from '@/components/shared/app-layout';

export default function GuardianLayout({ children }: { children: ReactNode }) {
  return <AppLayout userType="guardian">{children}</AppLayout>;
}
