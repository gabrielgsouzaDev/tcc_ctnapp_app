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
      {/* O div a seguir usa text-left e um padding para empurrar o texto para a direita, simulando o espaço do ícone. */}
      <div className="text-left pl-12">
        <p className="font-subtitle text-xs font-bold tracking-widest text-primary leading-none">CANTINA APP</p>
        <h1 className="font-subtitle text-6xl font-bold text-primary leading-none -mt-1">Bemmu.</h1>
      </div>
      <p className="text-muted-foreground mt-2 text-center">A cantina na palma da sua mão.</p>
    </Link>
  );
}
