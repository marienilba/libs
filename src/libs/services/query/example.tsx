"use client";

import { useMutation, useQuery } from "@/libs/services/query";
import { Prettify } from "@/libs/types";
import Link from "next/link";

export default function Home() {
  const { data } = useQuery(
    ["page"] as const,
    async ({ signal, queryKeys }) => {
      const res = await fetch("https://dummyjson.com/users", { signal });
      const data = await res.json();
      return data as Prettify<JSONData>;
    }
  );

  const { mutate } = useMutation(async (text: string) => ({ test: "ok" }));

  return (
    <main className="bg-pink-200 p-4 min-h-screen">
      <Link href="/2">GO</Link>

      {JSON.stringify(data, null, 2)}
    </main>
  );
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  domain: string;
  ip: string;
  address: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    postalCode: string;
    state: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    address: {
      address: string;
      city: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      postalCode: string;
      state: string;
    };
    department: string;
    name: string;
    title: string;
  };
  ein: string;
  ssn: string;
  userAgent: string;
}

interface JSONData {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}
