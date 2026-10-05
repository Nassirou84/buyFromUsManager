import { useLocales } from '@/locales';
import { useState, useEffect } from 'react';

type Props = {
  onResend: () => void;
}

export default function ResendCodeCountdown({ onResend }: Props) {
  const { t } = useLocales();

  const initialCooldown = 60;
  const [timer, setTimer] = useState<number>(initialCooldown);
  const [isResending, setIsResending] = useState<boolean>(false);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-sm text-gray-600 flex items-center justify-center gap-1.5">
      <span>{t('did_not_receive_code')}</span>
      {timer > 0 ? (
        <span className="font-semibold text-gray-500 cursor-not-allowed">
          {t('resend_in', { time: formatTime(timer) })}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsResending(true);
            onResend();
            setTimer(initialCooldown);
            setIsResending(false);
          }}
          disabled={isResending}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 transition focus:outline-none"
        >
          {isResending ? t('sending') : t('resend_code')}
        </button>
      )}
    </div>
  )
}