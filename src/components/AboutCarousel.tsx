"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  "/images/about/slide-1.jpg.jpeg",
  "/images/about/slide-2.jpg.jpeg",
  "/images/about/slide-3.jpg.jpeg",
  "/images/about/slide-4.jpg.jpeg",
  "/images/about/slide-5.jpg.jpeg",
];

export default function AboutCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const showSlide = (index: number) => {
    setActiveSlide((index + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FBF3E7] shadow-sm">
      {SLIDES.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`Aura Foods story slide ${index + 1}`}
          fill
          priority={index === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-contain transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <button
        type="button"
        onClick={() => showSlide(activeSlide - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-cinnamon/80 px-3 py-2 text-xl text-cream shadow-md"
      >
        &#8249;
      </button>
      <button
        type="button"
        onClick={() => showSlide(activeSlide + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-cinnamon/80 px-3 py-2 text-xl text-cream shadow-md"
      >
        &#8250;
      </button>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {SLIDES.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => showSlide(index)}
            aria-label={`Show slide ${index + 1}`}
            className={`h-2.5 w-2.5 rounded-full border border-cinnamon ${index === activeSlide ? "bg-cinnamon" : "bg-cream/80"}`}
          />
        ))}
      </div>
    </div>
  );
}
