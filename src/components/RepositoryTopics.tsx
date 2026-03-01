import { Badge } from "@/components/ui/badge";
import { UI } from "@/lib/constants";

interface RepositoryTopicsProps {
  topics: string[];
  maxDisplay?: number;
  showTitle?: boolean;
}

export function RepositoryTopics({
  topics,
  maxDisplay = UI.MAX_TOPICS_DISPLAY,
  showTitle = false,
}: RepositoryTopicsProps) {
  if (topics.length === 0) {
    return null;
  }

  const displayTopics = topics.slice(0, maxDisplay);
  const remainingCount = topics.length - maxDisplay;

  return (
    <div className={showTitle ? "space-y-2" : undefined}>
      {showTitle && <h2 className="text-lg font-semibold">Topics</h2>}
      <div className="flex flex-wrap gap-2">
        {displayTopics.map((topic) => (
          <Badge key={topic} variant="secondary">
            {topic}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline">+{remainingCount}</Badge>
        )}
      </div>
    </div>
  );
}
