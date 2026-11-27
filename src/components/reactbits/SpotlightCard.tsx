"use client";

// From React Bits (https://reactbits.dev) by David Haz — MIT + Commons Clause, see ./LICENSE.md.
// Local tweaks for Aura Foods are marked with "AURA:".
import React, { useEffect, useRef, useState } from 'react';

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)'
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const [opacity, setOpacity] = useState<number>(0);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (isFocused) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (frame.current !== null) return;

    // Update the gradient at most once per display frame without re-rendering the card.
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const card = divRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spotlight-x', `${pointer.current.x - rect.left}px`);
      card.style.setProperty('--spotlight-y', `${pointer.current.y - rect.top}px`);
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`} // AURA: styling comes from className
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at var(--spotlight-x, 0px) var(--spotlight-y, 0px), ${spotlightColor}, transparent 80%)`
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
