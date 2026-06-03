'use client';

import { useEffect, useRef, useState } from 'react';

export interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per char
  startDelay?: number;
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 28,
  startDelay = 0,
  className,
  cursor = true,
  onComplete,
}: TypewriterTextProps) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setDisplay('');
    setDone(false);
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(() => {
      const step = () => {
        setDisplay(text.slice(0, i + 1));
        i++;
        if (i < text.length) {
          timeoutId = setTimeout(step, speed);
        } else {
          setDone(true);
          onComplete?.();
        }
      };
      step();
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className={className}>
      {display}
      {cursor && !done && (
        <span className="ml-0.5 inline-block h-[1em] w-[0.6ch] -translate-y-[0.1em] animate-pulse-fast bg-primary align-middle" />
      )}
    </span>
  );
}
