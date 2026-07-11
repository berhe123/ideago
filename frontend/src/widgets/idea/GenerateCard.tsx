import type { ReactNode } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { useGenerateBlueprint } from '@/features/blueprint/api';
import { EmptyState } from '@/shared/ui/empty';
import { Button } from '@/shared/ui/button';

export function GenerateCard({
  ideaId,
  kind,
  title,
  description,
  icon,
}: {
  ideaId: string;
  kind: 'validation' | 'business' | 'product' | 'design';
  title: string;
  description: string;
  icon: ReactNode;
}) {
  const generate = useGenerateBlueprint(ideaId);
  const pending = generate.isPending && generate.variables === kind;

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        <Button onClick={() => generate.mutate(kind)} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Generate
        </Button>
      }
    />
  );
}
