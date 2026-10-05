import { Button, ButtonProps } from '@/components/ui/button';
import { Spinner } from '../ui/spinner';

type ButtonLoadingProps = ButtonProps & {
  isLoading: boolean;
};

export default function ButtonLoading({
  isLoading,
  children,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button {...props} disabled={isLoading}>
      {isLoading ? <Spinner /> : null}
      {children}
    </Button>
  );
}
