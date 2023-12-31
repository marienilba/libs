"use client";

import json from "./data.json";
const users: User[] = json as any;
import { DataTable } from "@/libs/components/datatable";
import { DataTableRef } from "@/libs/components/datatable/datatable";
import { useSyncURL, useSyncURLSelector } from "@/libs/services/syncURL";
import { ComponentProps, useRef } from "react";
import { z } from "zod";

const schema = z.object({ q: z.string() }).deepPartial();

export default function Home() {
  const { data } = useSyncURL(schema);
  const [search, setSearch] = useSyncURLSelector(data, (data) => data.q, "");

  // Fetch example
  const loader = DataTable.buildLoader(({ page, size, order }, [search]) =>
    fetch(
      DataTable.buildURL("https://dummyjson.com/users/search", {
        limit: size,
        skip: page * size,
        q: search as string,
      })
    )
      .then((r) => r.json() as Promise<JSONData>)
      .then((d) => ({ data: d.users, total: d.total }))
      .catch(() => ({ data: [], total: 0 }))
  );

  // Raw data example
  const usersLoader = DataTable.buildLoader(
    async ({ page, size, order }, [search]) => {
      let filtered =
        search && typeof search === "string"
          ? users.filter(
              (u) =>
                u.lastName.toLowerCase().includes(search.toLowerCase()) ||
                u.firstName.toLowerCase().includes(search.toLowerCase())
            )
          : users;

      let data = structuredClone(filtered);

      Array.from(order)
        .filter(([_, dir]) => dir !== "none")
        .map(
          ([col, dir]) =>
            [col, dir === "ascending" ? 1 : 0] as [keyof User, 1 | 0]
        )
        .forEach(([col, gte]) =>
          data.sort((a, b) => {
            return gte
              ? a[col]! > b[col]!
                ? 1
                : -1
              : b[col]! > a[col]!
              ? 1
              : -1;
          })
        );

      data = filtered.slice(page * size, page * size + size);

      return { data: data, total: filtered.length };
    }
  );

  const ref = useRef<DataTableRef<typeof loader>>(null);

  return (
    <main className="bg-slate-950 p-4 min-h-screen">
      <button
        className="bg-slate-900 text-white px-2.5 py-1 rounded cursor-pointer hover:bg-slate-950 focus-within:bg-slate-800"
        onClick={async () => {
          if (ref.current) await ref.current.refetch();
        }}
      >
        Refetch
      </button>
      <DataTable.Root ref={ref} loader={loader} states={[search]} history>
        <div className="flex items-center justify-between">
          <DataTable.Size className="text-sm rounded block p-2.5 bg-slate-800 border border-slate-700 placeholder-slate-500 text-white my-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            className="rounded block p-2.5 bg-slate-800 border-slate-700 border text-sm text-white"
          />
        </div>

        <DataTable.Table
          className="table-auto bg-gray-800 text-white border-collapse w-full"
          fallback={NoResult}
        >
          <DataTable.Header>
            <DataTable.Col
              name="firstName"
              className="px-4 py-2 group max-sm:hidden"
            >
              <Order label="firstName" />
            </DataTable.Col>
            <DataTable.Col
              name="lastName"
              className="px-4 py-2 group max-sm:hidden"
            >
              <Order label="lastName" />
            </DataTable.Col>
            <DataTable.Col name="age" className="px-4 py-2 max-sm:hidden">
              age
            </DataTable.Col>
          </DataTable.Header>
          <DataTable.Body<
            typeof loader
          > className="data-[loading=true]:opacity-50 data-[loading=true]:cursor-not-allowed">
            {({ firstName, lastName, age }) => (
              <DataTable.Row className="odd:bg-gray-700">
                <DataTable.Data
                  data-cell="firstName"
                  className="px-4 py-2 max-sm:py-1 max-sm:my-1 max-sm:grid max-sm:grid-cols-[15ch_auto] before:capitalize before:font-extrabold before:content-[attr(data-cell)_':_']"
                >
                  {firstName}
                </DataTable.Data>
                <DataTable.Data
                  data-cell="lastName"
                  className="px-4 py-2 max-sm:py-1 max-sm:my-1 max-sm:grid max-sm:grid-cols-[15ch_auto] before:capitalize before:font-extrabold before:content-[attr(data-cell)_':_']"
                >
                  {lastName}
                </DataTable.Data>
                <DataTable.Data
                  data-cell="age"
                  className="px-4 py-2 max-sm:py-1 max-sm:my-1 max-sm:grid max-sm:grid-cols-[15ch_auto] before:capitalize before:font-extrabold before:content-[attr(data-cell)_':_']"
                >
                  {age}
                </DataTable.Data>
              </DataTable.Row>
            )}
          </DataTable.Body>
        </DataTable.Table>

        <div className="flex justify-between py-2">
          <DataTable.Total className="text-white py-2 font-bold" />

          <DataTable.Pagination
            length={5}
            className="flex items-center gap-0.5"
          >
            <DataTable.Arrow start className="disabled:opacity-25 text-white">
              <DoubleArrow className="w-4 h-4" />
            </DataTable.Arrow>
            <DataTable.Arrow
              previous
              className="disabled:opacity-25 text-white"
            >
              <Arrow className="w-4 h-4" />
            </DataTable.Arrow>
            <DataTable.Pages className="w-6 h-6 bg-gray-500 text-white rounded data-[current=true]:bg-slate-800" />
            <DataTable.Arrow next className="disabled:opacity-25 text-white">
              <Arrow className="w-4 h-4 rotate-180" />
            </DataTable.Arrow>
            <DataTable.Arrow end className="disabled:opacity-25 text-white">
              <DoubleArrow className="w-4 h-4 rotate-180" />
            </DataTable.Arrow>
          </DataTable.Pagination>
        </div>
      </DataTable.Root>
    </main>
  );
}

const Arrow = ({ ...props }: ComponentProps<"svg">) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="4"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const DoubleArrow = ({ ...props }: ComponentProps<"svg">) => (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="3"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
    />
  </svg>
);

const NoResult = () => (
  <div className="bg-slate-950 w-full py-10 text-white text-center text-2xl font-extrabold ">
    No user found 😞
  </div>
);

const Order = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center gap-2">
    <p>{label}</p>
    <DataTable.Order className="cursor-pointer group-data-[direction=descending]:rotate-180 transition-transform duration-300">
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
        />
      </svg>
    </DataTable.Order>
  </div>
);

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
