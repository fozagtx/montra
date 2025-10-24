"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function DiscordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#F9FAFB] to-[#F0F2F5]">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex flex-col items-center justify-center text-center space-y-4"
      >
        <Image
          src="/discord.png"
          alt="Discord Logo"
          width={100}
          height={100}
          className="drop-shadow-md"
        />
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
          Monetize Discord Community
        </h1>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-sm text-gray-500"
        >
          Coming Soon
        </motion.p>
      </motion.div>
    </div>
  );
}
