import Link from 'next/link';

interface TopicBadgeProps {
  name: string;
  slug: string;
}

export function TopicBadge({ name, slug }: TopicBadgeProps) {
  return (
    <Link
      href={`/topics/${slug}`}
      className="hover:bg-primary/20 hover:border-primary inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
    >
      {name}
    </Link>
  );
}
