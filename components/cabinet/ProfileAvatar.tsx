"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  name: string;
  image: string | null;
  size?: number;
};

/** Аватар Google с fallback на инициалы при ошибке загрузки. */
export function ProfileAvatar({ name, image, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = name.charAt(0).toUpperCase() || "?";

  if (!image || failed) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-accent-ink"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={image}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-full ring-1 ring-border"
      onError={() => setFailed(true)}
    />
  );
}
