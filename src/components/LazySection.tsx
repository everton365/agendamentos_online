import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  minHeight?: string;
}

const LazySection = ({
  children,
  fallback,
  rootMargin = "200px",
  minHeight = "200px",
}: LazySectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? undefined : minHeight }}>
      {isVisible
        ? children
        : fallback || (
            <div className="animate-pulse bg-muted rounded-lg w-full" style={{ minHeight }} />
          )}
    </div>
  );
};

export default LazySection;
