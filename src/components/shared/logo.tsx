
import { cn } from "@/lib/utils";
import Link from "next/link";

const ChefHatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("text-primary", props.className)}
        {...props}
    >
        <path
            d="M25.6667 31.6667H12.3333C10.1242 31.6667 8.33334 29.8758 8.33334 27.6667V24.5C8.33334 22.2908 10.1242 20.5 12.3333 20.5H25.6667C27.8758 20.5 29.6667 22.2908 29.6667 24.5V27.6667C29.6667 29.8758 27.8758 31.6667 25.6667 31.6667Z"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M9.91666 20.5V16.525C9.91666 14.8083 11.3083 13.4167 12.9917 13.4167H25.0083C26.6917 13.4167 28.0833 14.8083 28.0833 16.525V20.5"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M19 4.75C21.6234 4.75 23.75 6.87665 23.75 9.5V11.0833H14.25V9.5C14.25 6.87665 16.3767 4.75 19 4.75Z"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
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
            <ChefHatIcon className="h-10 w-10 shrink-0"/>
            <div className="text-left">
                 <p className="text-sm font-semibold tracking-widest text-primary leading-none">CANTINA APP</p>
                 <h1 className="font-headline text-6xl font-bold text-primary leading-none -mt-1">Bemmu.</h1>
            </div>
        </div>
        <p className="text-muted-foreground mt-2">A cantina na palma da sua mão.</p>
    </Link>
  );
}
