
'use client';

import { cn } from '@/lib/utils';
// Note: This is a simplified, mock QR code component using a static image.
// In a real application, you would use a library like 'qrcode.react'
// to generate a QR code from the provided `value`.
import Image from 'next/image';

export function QRCode({ value, className }: { value: string, className?: string }) {
    // For demonstration purposes, we use a static placeholder image.
    const mockQrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(value);

  return (
    <div className={cn("flex items-center justify-center", className)}>
        <Image
            src={mockQrCodeUrl}
            alt="Mock QR Code"
            width={200}
            height={200}
            className="rounded-md"
        />
    </div>
  );
}
