import Image from "next/image";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { getMessages } from "@/lib/messages";

interface OwnerAvatarProps {
  login: string;
  avatarUrl: string;
  size?: 40 | 64;
  locale?: Locale;
}

export function OwnerAvatar({
  login,
  avatarUrl,
  size = 40,
  locale = DEFAULT_LOCALE,
}: OwnerAvatarProps) {
  const m = getMessages(locale);
  return (
    <Image
      src={avatarUrl}
      alt={`${login}${m.avatarAlt}`}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}
