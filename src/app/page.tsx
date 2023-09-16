"use client";

import { DataTable } from "@/libs/datatable";
import { ComponentProps } from "react";

export default function Home() {
  const loader: DataTable.Loader = ({ page, size, order }) =>
    fetch("https://dummyjson.com/users?limit=" + size + "&skip=" + page * size)
      .then((r) => r.json() as Promise<JSONData>)
      .then((d) => ({ data: d.users, total: d.total }));

  return (
    <main className="bg-pink-100 p-4 min-h-screen">
      <DataTable.Root loader={loader}>
        <DataTable.Size sizes={[10, 20, 30]} />
        <DataTable.Pagination
          length={5}
          className="flex items-center gap-0.5 py-2"
        >
          <DataTable.Arrow previous className="disabled:opacity-25">
            <Arrow className="w-4 h-4" />
          </DataTable.Arrow>
          <DataTable.Pages className="w-6 h-6 bg-gray-500 text-white rounded data-[current=true]:bg-slate-800" />
          <DataTable.Arrow next className="disabled:opacity-50">
            <Arrow className="w-4 h-4 rotate-180" />
          </DataTable.Arrow>
        </DataTable.Pagination>
        <DataTable.Table className="table-auto bg-gray-800 text-white border-collapse">
          <DataTable.Header>
            <DataTable.Col
              name="firstName"
              className="px-4 py-2 flex justify-between items-center gap-2 group"
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
