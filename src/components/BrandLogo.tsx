// [FIXED] - Add VanBasket Brand Logo & Name Everywhere
import React from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  textClassName?: string;
  href?: string;
  className?: string;
}

export default function BrandLogo({
  width = 120,
  height = 40,
  showText = true,
  textClassName = "text-xl font-serif font-black tracking-tight text-brand-espresso",
  href,
  className = "",
}: BrandLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width, height }}>
        <Image
          src="/logo.png"
          alt="VanBasket Logo"
          fill
          sizes={`${width}px`}
          priority
          className="object-contain"
        />
      </div>
      {showText && <span className={textClassName}>VanBasket</span>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="VanBasket Home">
        {content}
      </Link>
    );
  }

  return content;
}
