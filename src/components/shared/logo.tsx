
import { cn } from "@/lib/utils";
import Link from "next/link";


export function Logo({ isSidebar = false }: { isSidebar?: boolean }) {
  if (isSidebar) {
    return (
        <Link href="/" className="flex items-center gap-2">
            <span className="font-subtitle text-2xl font-bold text-primary">Bemmu.</span>
        </Link>
    )
  }

  return (
    <Link href="/" className="flex flex-col items-center">
      <div className="text-left">
        <h1 className="font-subtitle text-6xl font-bold text-primary leading-none">Bemmu.</h1>
      </div>
      <p className="text-muted-foreground mt-2 text-center">A cantina na palma da sua mão.</p>
    </Link>
  );
}
