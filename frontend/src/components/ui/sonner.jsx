import { Toaster as Sonner } from 'sonner';

export function Toaster(props) {
  return (
    <Sonner
      position="bottom-right"
      offset={20}
      toastOptions={{
        classNames: {
          toast:
            '!rounded-2xl !border !border-border !bg-card !font-sans !text-foreground !shadow-xl',
          description: '!text-muted-foreground',
          actionButton: '!rounded-full !bg-primary !text-primary-foreground !font-semibold',
        },
      }}
      {...props}
    />
  );
}
