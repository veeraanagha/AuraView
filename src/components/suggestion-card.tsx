import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

interface SuggestionCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SuggestionCard({ icon: Icon, title, children, className }: SuggestionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <div className="bg-primary/10 p-2 rounded-lg">
           <Icon className="h-6 w-6 text-accent" />
        </div>
        <CardTitle className="text-xl font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-foreground/80 font-body leading-relaxed">{children}</div>
      </CardContent>
    </Card>
  );
}

const SkeletonComponent = () => (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent className='space-y-2'>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
);

SuggestionCard.Skeleton = SkeletonComponent;
