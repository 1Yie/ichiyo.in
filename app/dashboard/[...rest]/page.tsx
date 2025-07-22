import type { Metadata } from "next";


import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "ichiyo | 404",
};


export default function CatchAllPage() {
  notFound();
}
