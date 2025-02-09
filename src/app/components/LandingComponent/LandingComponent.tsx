"use client";

import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useRouter } from "next/navigation";

export function LandingComponent() {
  const router = useRouter();

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        {/* Logos Side by Side */}
        <div className="flex items-center gap-4">
        <Image
        className="mr-10"
            src="/team-logo.png" // Update with actual team logo path
            alt="Team Logo"
            width={150}
            height={150}
          />
          <Image
          className="mr-10"
            src="/x-logo.png" // Update with actual logo path
            alt="Eco-Chef Logo"
            width={50}
            height={50}
          />
          <Image
            src="/Favicom.png" // Update with actual logo path
            alt="Eco-Chef Logo"
            width={80}
            height={80}
          />
          
        </div>

        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          Welcome to Eco-Chef
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          "Zero Waste, Full Taste :)"
        </div>
        <button
          onClick={() => router.push("/auth")}
          className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2"
        >
          Get Started
        </button>
      </motion.div>
    </AuroraBackground>
  );
}
