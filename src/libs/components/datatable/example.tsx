"use client";

import { DataTable } from "@/libs/components/datatable";
import { DataTableRef } from "@/libs/components/datatable/datatable";
import { ComponentProps, useRef, useState } from "react";

export default function Home() {
  const [search, setSearch] = useState<string>("");
  const loader = DataTable.buildLoader(({ page, size, order }, [search]) =>
    fetch(
      "https://dummyjson.com/users/search?limit=" +
        size +
        "&skip=" +
        page * size +
        "&q=" +
        search?.toString()
    )
      .then((r) => r.json() as Promise<JSONData>)
      .then((d) => ({ data: d.users, total: d.total }))
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
      <DataTable.Root ref={ref} loader={loader} states={[search]}>
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
              className="px-4 py-2 flex text-center justify-center items-center gap-2 group"
            >
              firstName
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
            </DataTable.Col>
            <DataTable.Col name="lastName" className="px-4 py-2">
              lastName
            </DataTable.Col>
            <DataTable.Col name="age" className="px-4 py-2">
              age
            </DataTable.Col>
          </DataTable.Header>
          <DataTable.Body<typeof loader>>
            {({ firstName, lastName, age }) => (
              <DataTable.Row className="odd:bg-gray-700">
                <DataTable.Data className="px-4 py-2">
                  {firstName}
                </DataTable.Data>
                <DataTable.Data className="px-4 py-2">
                  {lastName}
                </DataTable.Data>
                <DataTable.Data className="px-4 py-2">{age}</DataTable.Data>
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
  <div className="bg-slate-950 w-full text-white text-center text-2xl font-extrabold ">
    No user found 😞
  </div>
);
