import { useState, useEffect } from 'react';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useBreakpoint(breakpoint) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = `(min-width: ${breakpoints[breakpoint]}px)`;
    const media = window.matchMedia(query);

    const handleChange = () => setMatches(media.matches);
    handleChange();

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return matches;
}
