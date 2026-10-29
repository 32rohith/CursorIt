'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

// Constants for vertical dock
const DOCK_WIDTH = 72;
const DEFAULT_MAGNIFICATION = 68; // Increased from 56 for more pronounced effect
const DEFAULT_DISTANCE = 120; // Reduced from 150 to make hover effect more sensitive
const DEFAULT_PANEL_WIDTH = 64;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelWidth?: number;
  magnification?: number;
  spring?: SpringOptions;
};
type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};
type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};
type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DocContextType = {
  mouseY: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};
type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function VerticalDock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 180, damping: 15 }, // Adjusted spring for snappier animation
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelWidth = DEFAULT_PANEL_WIDTH,
}: DockProps) {
  const mouseY = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  // Keep a fixed position for the dock while allowing the contents to animate
  return (
    <div className="flex flex-col items-center" style={{ width: panelWidth }}>
      <div 
        className={cn(
          'flex h-fit w-full flex-col gap-4 rounded-r-2xl bg-neutral-900 py-4 px-2',
          className
        )}
        onMouseMove={({ pageY }) => {
          isHovered.set(1);
          mouseY.set(pageY);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseY.set(Infinity);
        }}
        onTouchMove={(e) => {
          isHovered.set(1);
          mouseY.set(e.touches[0].pageY);
        }}
        onTouchEnd={() => {
          isHovered.set(0);
          mouseY.set(Infinity);
        }}
        style={{ width: panelWidth }}
        role='toolbar'
        aria-label='Application dock'
      >
        <DockProvider value={{ mouseY, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </div>
    </div>
  );
}

function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { distance, magnification, mouseY, spring } = useDock();

  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseY, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - domRect.y - domRect.height / 2;
  });

  const heightTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  );

  const height = useSpring(heightTransform, spring);

  // Add a scale transform to make icons "pop out" more from their container
  const scale = useTransform(
    height,
    [40, magnification],
    [1, 1.08]  // Add a slight extra scale when fully magnified
  );

  return (
    <motion.div
      ref={ref}
      style={{ height, scale }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center mx-auto z-10',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement, { height, isHovered } as any)
      )}
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 28 }} // Reduced from 60 to place tooltip closer to icons
          exit={{ opacity: 0, x: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute left-full top-1/2 ml-1 w-fit -translate-y-1/2 whitespace-pre rounded-md border border-neutral-800 bg-neutral-800 px-2 py-0.5 text-xs text-white z-20',
            className
          )}
          role='tooltip'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const height = restProps['height'] as MotionValue<number>;

  const heightTransform = useTransform(height, (val) => val * 0.6); // Increased scaling factor from 0.5 to 0.6

  return (
    <motion.div
      style={{ height: heightTransform }}
      className={cn('flex items-center justify-center w-full', className)}
    >
      {children}
    </motion.div>
  );
}

export { VerticalDock, DockIcon, DockItem, DockLabel }; 