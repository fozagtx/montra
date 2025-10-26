"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function RotatingHeroText() {
  const [index, setIndex] = useState(0);

  const items = [
    { type: "text", content: "skills" },
    { type: "text", content: "value" },
    { type: "discord" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl md:text-7xl relative z-10 flex flex-wrap justify-center items-center gap-3">
      Monetize your
      <span className="relative inline-flex items-center transition-all duration-700 ease-in-out">
        {items[index].type === "text" ? (
          <span className="ml-3 text-primary animate-fadeIn capitalize">
            {items[index].content}
          </span>
        ) : (
          <span className="ml-3 flex items-center gap-2 animate-fadeIn">
            <Image
              src="/discord.png"
              alt="Discord"
              width={42}
              height={42}
              className="rounded-full"
            />
            <span className="text-primary capitalize">communities</span>
          </span>
        )}
      </span>
    </h1>
  );
}
