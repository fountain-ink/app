'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createMailingList } from '@/lib/listmonk/newsletter';
import { toast } from 'sonner';

interface CreateNewsletterButtonProps {
  blogIdentifier: string;
  onSuccess?: (listId: number) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CreateNewsletterButton({
  blogIdentifier,
  onSuccess,
  variant = 'default',
  size = 'default',
  className,
}: CreateNewsletterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateList = async () => {
    setIsLoading(true);
    try {
      const result = await createMailingList(blogIdentifier);
      
      if (result?.success) {
        toast.success('Mailing list created successfully');
        onSuccess?.(result.data?.listId as number);
      } else {
        toast.error(result?.error || 'Failed to create mailing list');
      }
    } catch (error) {
      console.error('Error creating mailing list:', error);
      toast.error('An error occurred while creating the mailing list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreateList}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? 'Creating...' : 'Create Mailing List'}
    </Button>
  );
} 