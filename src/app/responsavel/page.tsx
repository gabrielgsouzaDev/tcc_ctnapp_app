
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta página agora serve apenas como um redirecionamento temporário para a autenticação.
export default function ResponsavelRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/guardian');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      <p>Redirecionando para a página de autenticação...</p>
    </div>
  );
}
