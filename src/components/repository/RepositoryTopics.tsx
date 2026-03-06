import { memo } from "react";
import { Badge } from "@/components/ui";
import { UI } from "@/lib/constants";
import { DEFAULT_LOCALE, type Locale, getMessages } from "@/lib/i18n";

interface RepositoryTopicsProps {
  topics: string[];
  maxDisplay?: number;
  showTitle?: boolean;
  locale?: Locale | undefined;
}

export const RepositoryTopics = memo(function RepositoryTopics({
  topics,
  maxDisplay = UI.MAX_TOPICS_DISPLAY,
  showTitle = false,
  locale = DEFAULT_LOCALE,
}: RepositoryTopicsProps) {
  if (topics.length === 0) {
    return null;
  }

  const displayTopics = topics.slice(0, maxDisplay);
  const remainingCount = topics.length - maxDisplay;
  const m = getMessages(locale);

  return (
    <div className={showTitle ? "space-y-2" : undefined}>
      {showTitle && <h2 className="text-lg font-semibold">{m.topics}</h2>}
      <div className="flex flex-wrap gap-2">
        {displayTopics.map((topic) => (
          <Badge key={topic} variant="topic">
            {topic}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline">+{remainingCount}</Badge>
        )}
      </div>
    </div>
  );
});
