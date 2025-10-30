
import { cn } from "@/lib/utils";
import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";


export function Logo({ isSidebar = false }: { isSidebar?: boolean }) {
  if (isSidebar) {
    return (
        <Link href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-subtitle text-2xl font-bold text-primary">Bemmu.</span>
        </Link>
    )
  }

  return (
    <div className="text-center">
      <Link href="/" className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-4">
            <UtensilsCrossed className="h-12 w-12 text-primary" />
            <h1 className="font-subtitle text-6xl font-bold text-primary leading-none">Bemmu.</h1>
          </div>
        <p className="text-muted-foreground mt-2 text-center">A cantina na palma da sua mão.</p>
      </Link>
    </div>
  );
}
