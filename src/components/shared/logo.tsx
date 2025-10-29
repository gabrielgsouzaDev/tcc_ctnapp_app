import { cn } from "@/lib/utils";
import Link from "next/link";

const ChefHatIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 68 68"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M48.875 34C48.875 28.5334 47.4583 24.3334 44.625 21.4C41.7917 18.4667 38.0417 17 33.375 17C28.7083 17 24.9583 18.4667 22.125 21.4C19.2917 24.3334 17.875 28.5334 17.875 34H17V42.5H49.8333V34H48.875ZM33.375 21.25C35.9583 21.25 38.1667 21.9833 40 23.45C41.8333 24.9167 43.125 26.8917 43.875 29.375H22.875C23.625 26.8917 24.9167 24.9167 26.75 23.45C28.5833 21.9833 30.7917 21.25 33.375 21.25ZM17 46.75V51H51V46.75H17Z"
      fill="currentColor"
    />
  </svg>
);


export function Logo({ isSidebar = false }: { isSidebar?: boolean }) {
  if (isSidebar) {
    return (
        <Link href="/" className="flex items-center gap-2">
            <ChefHatIcon className="h-6 w-6 text-primary shrink-0"/>
            <span className="font-headline text-2xl font-bold text-primary">Bemmu</span>
        </Link>
    )
  }

  return (
    <Link href="/" className="flex flex-col items-center text-center">
      <div className="flex items-end gap-2">
        <ChefHatIcon className="h-10 w-10 shrink-0 text-primary" />
        <div className="text-left relative -top-2">
          <p className="font-subtitle text-xs font-bold tracking-widest text-primary leading-none">CANTINA APP</p>
          <h1 className="font-headline text-6xl font-bold text-primary leading-none -mt-1">Bemmu.</h1>
        </div>
      </div>
      <p className="text-muted-foreground mt-2">A cantina na palma da sua mão.</p>
    </Link>
  );
}
