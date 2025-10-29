import { cn } from "@/lib/utils";
import Link from "next/link";


export function Logo({ isSidebar = false }: { isSidebar?: boolean }) {
  if (isSidebar) {
    return (
        <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-2xl font-bold text-primary">Bemmu</span>
        </Link>
    )
  }

  return (
    <Link href="/" className="flex flex-col items-center text-center">
      <div className="flex items-end">
        <div className="text-left">
          <p className="font-subtitle text-xs font-bold tracking-widest text-primary leading-none">CANTINA APP</p>
          <h1 className="font-headline text-6xl font-bold text-primary leading-none -mt-1">Bemmu.</h1>
        </div>
      </div>
      <p className="text-muted-foreground mt-2">A cantina na palma da sua mão.</p>
    </Link>
  );
}
