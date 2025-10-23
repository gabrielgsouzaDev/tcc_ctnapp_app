
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta página agora serve apenas como um redirecionamento temporário para o protótipo.
export default function AlunoAuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      <p>Redirecionando...</p>
    </div>
  );
}
