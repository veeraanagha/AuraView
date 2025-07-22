import { AuraViewClient } from '@/components/aura-view-client';
import { Wind } from 'lucide-react';

export default function SuggestionsPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background font-body">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-full">
            <Wind className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            AuraView AI
          </h1>
        </div>
      </header>
      <main className="flex-1">
        <AuraViewClient />
      </main>
    </div>
  );
}
