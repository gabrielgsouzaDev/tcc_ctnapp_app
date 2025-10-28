
import { cn } from "@/lib/utils";
import Link from "next/link";

const ChefHatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={cn("h-10 w-10 text-primary", props.className)}
        {...props}
    >
        <path d="M5 22a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5Z"/>
        <path d="M6 14V10a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4"/>
        <path d="M12 2a4 4 0 0 1 4 4v2H8V6a4 4 0 0 1 4-4Z"/>
    </svg>
);


export function Logo({ isSidebar = false }: { isSidebar?: boolean }) {
  if (isSidebar) {
    return (
        <Link href="/" className="flex items-center gap-2">
            <ChefHatIcon className="h-6 w-6"/>
            <span className="font-headline text-2xl font-bold text-primary">Bemmu</span>
        </Link>
    )
  }

  return (
    <Link href="/" className="flex flex-col items-center text-center">
        <div className="flex items-end gap-2">
            <ChefHatIcon />
            <div>
                 <p className="text-sm font-semibold tracking-wider text-primary">CANTINA APP</p>
                 <h1 className="font-headline text-6xl font-bold text-primary leading-none -mt-1">Bemmu.</h1>
            </div>
        </div>
        <p className="text-muted-foreground mt-2">A cantina na palma da sua mão.</p>
    </Link>
  );
}
