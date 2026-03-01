import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">ページが見つかりません</h2>
      <p className="mt-2 text-muted-foreground">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link href="/search" className="mt-6">
        <Button>検索ページに戻る</Button>
      </Link>
    </div>
  );
}
