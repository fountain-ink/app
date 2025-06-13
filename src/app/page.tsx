"use client";

import { RoughNotation, RoughNotationGroup } from "react-rough-notation";
import Image from "next/image";
import React from "react";
import "@/styles/article.css";

const features = [
  {
    image: "/images/no-tech-1.svg",
    title: "No big tech or vendor lock-in",
    description: (
      <>
        Fountain is built on user ownership of and decentralisation, secured by{" "}
        <RoughNotation type="underline" color="hsl(var(--primary))" order={4}>
          <span className="text-primary whitespace-nowrap">Ethereum</span>
        </RoughNotation>
        . We believe in{" "}
        <RoughNotation type="underline" color="hsl(var(--primary))" order={4}>
          <a href="https://github.com/fountain-ink/app" target="_blank" className="text-primary whitespace-nowrap">open-source</a>
        </RoughNotation>{" "}
        and letting users stay in control of their writing and audience.
      </>
    ),
    color: "bg-[#CFDFF7]",
  },
  {
    image: "/images/sun-transparent-2.png",
    title: "No ads - slow social",
    description: (
      <>
        The previous generation of social ran on attention maxxing and squeezing
        ad revenue out of users. We think users should control and{" "}
        <RoughNotation type="underline" color="hsl(var(--primary))" order={4}>
          <span className="text-primary whitespace-nowrap">
            own their content and connections
          </span>
        </RoughNotation>
        .
      </>
    ),
    color: "bg-[#D1EBDB]",
  },
  {
    image: "/images/hands-transparent-4.png",
    title: "Experiments in collaboration",
    description: (
      <>
        Fountain has{" "}
        <RoughNotation type="underline" color="hsl(var(--primary))" order={4}>
          <span className="text-primary whitespace-nowrap">
            multiplayer built in
          </span>
        </RoughNotation>
        , just like Figma or Notion. Beyond that, there are many kinds of groups
        and zines with super easy{" "}
        <RoughNotation type="underline" color="hsl(var(--primary))" order={4}>
          <span className="text-primary whitespace-nowrap">revenue splits</span>
        </RoughNotation>{" "}
        out of the box.
      </>
    ),
    color: "bg-[#FFF4C1]",
  },
  {
    image: "/images/notes-svg-4.svg",
    title: "Become a better writer",
    description: (
      <>
        Fountain is designed to be the world typewriter - no distractions when
        writing, but{" "}
        <RoughNotation type="underline" color="hsl(var(--primary))" order={4}>
          <span className="text-primary whitespace-nowrap">help you grow</span>
        </RoughNotation>{" "}
        as a writer through feedback from other users and AI assistants.
      </>
    ),
    color: "bg-[#FFE4E4]",
  },
];

const arrows = [
  "/images/arrow-right-1.svg",
  "/images/arrow-left-2.svg",
  "/images/arrow-right-3.svg",
];

export default function HomePage() {
  return (
    <main className="container article mx-auto px-4 py-16">
      <RoughNotationGroup show>
        <div className="text-center mb-16">
          <header className="text-6xl font-serif title">
            <RoughNotation type="highlight" color="#CFDFF7" order="1">
              Read
            </RoughNotation>
            ,{" "}
            <RoughNotation type="highlight" color="#D1EBDB" order="2">
              write
            </RoughNotation>{" "}
            &{" "}
            <RoughNotation type="highlight" color="#FFF4C1" order="3">
              collaborate
            </RoughNotation>
            <br />
            <RoughNotation type="underline" color="black" order="4">
              with others
            </RoughNotation>
          </header>
          <header className="!text-2xl !tracking-tighter !font-normal !mt-8 max-w-2xl mx-auto !text-primary/60 subtitle">
            Fountain is a blogging platform for experimentation on a new kind of
            collaborative internet.
          </header>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto gap-x-2 gap-y-4 md:gap-y-0 py-8 items-center">
          {features.map((feature, index) => {
            const featureEl = (
              <div
                className={`flex gap-8 items-start ${index % 2 === 0
                  ? "flex-row-reverse lg:flex-row"
                  : "flex-row"
                  }`}
              >
                <div
                  className={`sm:w-40 sm:h-40 w-28 h-28 rounded-lg flex-shrink-0 ${feature.color} overflow-hidden`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={128}
                    height={128}
                    className={`w-full h-full object-contain `}
                  />
                </div>
                <div
                  className={`pt-2 flex-grow ${index % 2 === 0 ? "text-right lg:text-left" : ""
                    }`}
                >
                  <h3 className="!text-xl sm:!text-2xl !p-0 !font-medium !mb-0">
                    {feature.title}
                  </h3>
                  <div className={` w-full flex ${index % 2 === 0 ? "lg:justify-start justify-end" : "justify-start"}`}>
                    <p className="!text-sm sm:!text-base !pt-0 sm:!pt-4 !leading-normal !tracking-tight !text-primary/50 !max-w-xs">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );

            const arrow = arrows[index];
            const arrowEl = arrow ? (
              <Image src={arrow} alt="arrow" width={80} height={80} />
            ) : (
              <div />
            );

            if (index % 2 === 0) {
              // Left feature, right arrow
              return (
                <React.Fragment key={feature.title}>
                  <div className="lg:col-span-1">{featureEl}</div>
                  <div className="hidden lg:flex items-center justify-start">
                    {arrowEl}
                  </div>
                </React.Fragment>
              );
            }
            // Left arrow, right feature
            return (
              <React.Fragment key={feature.title}>
                <div className="hidden lg:flex items-center justify-end mr-4">
                  {arrowEl}
                </div>
                <div className="lg:col-span-1">{featureEl}</div>
              </React.Fragment>
            );
          })}
        </div>
      </RoughNotationGroup>
    </main>
  );
}
