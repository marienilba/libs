"use client";

import XFetch, { xfetch } from "@/libs/services/xfetch";
import { useEffect } from "react";

XFetch.interceptors.response = async function (response, request) {
  console.log(response.status, request);
};

export default function Home() {
  useEffect(() => {
    xfetch("oaokaa").then(console.log);
  }, []);
  return <main className="bg-pink-200 p-4 min-h-screen"></main>;
}
