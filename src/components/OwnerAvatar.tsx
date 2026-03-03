import Image from "next/image";

interface OwnerAvatarProps {
  login: string;
  avatarUrl: string;
  size?: 40 | 64;
}

export function OwnerAvatar({
  login,
  avatarUrl,
  size = 40,
}: OwnerAvatarProps) {
  return (
    <Image
      src={avatarUrl}
      alt={`${login} のアバター`}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}
