import { useEffect, useRef } from 'react';

export function useMounted(callback: () => void) {
  const calledRef = useRef(false);

  useEffect(() => {
    if (!calledRef.current) {
      calledRef.current = true;
      callback();
    }
  }, []);
}
