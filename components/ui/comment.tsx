"use client";
import { useEffect, useRef } from "react";
import Artalk from "artalk";

export default function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const artalk = new Artalk({
      el: containerRef.current,
      pageKey: window.location.pathname,
      pageTitle: document.title,
      server: "https://artalk.ichiyo.in/",
      site: "blog-artalk",
      darkMode: "auto",
      flatMode: "auto",
    });

    return () => {
      artalk.destroy();
    };
  }, []);

  return (
    <>
      <div ref={containerRef}></div>
    </>
  );
}
