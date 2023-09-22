"use client";

import { useSyncURL } from "@/libs/services/syncURL";
import {
  AriaAttributes,
  ComponentProps,
  Fragment,
  ReactNode,
  Ref,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { ZodRawShape, z } from "zod";

const DataTable = () => {};

type OrderDir = Exclude<AriaAttributes["aria-sort"], "other" | undefined>;
type Order = Map<string, OrderDir>;
type OrderItem = [string, OrderDir];

type LoaderData = {
  data: Record<PropertyKey, any>[];
  total: number;
};
type LoaderParams = {
  page: number;
  size: number;
  order: Order;
};

export type Loader = (
  params: LoaderParams,
  states: Immutable[]
) => Promise<LoaderData>;

type BuildLoader = (params: LoaderParams, states: unknown[]) => unknown;

DataTable.buildLoader = function <TLoader extends BuildLoader>(
  loader: TLoader
) {
  return loader;
};

type FetchState = {
  mount: boolean;
  loading: boolean;
  error: boolean;
  success: boolean;
};

const ContextFetch = createContext<FetchState>({
  mount: false,
  loading: true,
  error: false,
  success: false,
});

const ContextLoader = createContext<LoaderData>({
  data: [],
  total: 0,
});

const SIZES = [10, 20, 30] as const;
const DEFAULT_SIZE: (typeof SIZES)[number] = 10;
const VALID_SIZE = (defaultSize: number, sizes: readonly number[]) => {
  if (sizes.includes(defaultSize)) return defaultSize;
  else
    throw new Error(
      `Invalid defaultSize ${defaultSize} not included in ${sizes.join(" | ")}`
    );
};

const ContextRootParams = createContext<{
  sizes: readonly number[];
  defaultSize: number;
}>({ sizes: SIZES, defaultSize: DEFAULT_SIZE });

const ContextParams = createContext<LoaderParams>({
  page: 0,
  size: 10,
  order: new Map(),
});

type ContextSetter = {
  changeOrder: (order: OrderItem) => void;
  changeSize: (size: number) => void;
  changePage: (page: number) => void;
};

const ContextSetter = createContext<ContextSetter>({
  changeOrder: (order) => {},
  changeSize: (size) => {},
  changePage: (page) => {},
});

type Immutable =
  | string
  | number
  | boolean
  | symbol
  | null
  | undefined
  | ReadonlyArray<any>
  | readonly [any, ...any[]]
  | { readonly [key: string]: any };

type RootRef<TLoader extends Loader> = {
  refetch: (states?: Immutable[]) => ReturnType<TLoader>;
  getPage: () => number;
  getSize: () => number;
  getOrder: () => Order;
  getData: () => GetLoaderData<TLoader>;
  getTotal: () => number;
  getStates: () => Immutable[];
  getState: () => FetchState;
} & ContextSetter;

type Together<TObj> = TObj | { [K in keyof TObj]?: never };

type RootProps<TLoader extends Loader> = {
  children: ReactNode;
  loader: TLoader;
  states?: Immutable[];
  history?: boolean;
} & Together<{ sizes: readonly number[]; defaultSize?: number }>;

export type DataTableRef<TLoader extends Loader> = RootRef<TLoader>;

function fowardedRoot<TLoader extends Loader>(
  {
    children,
    loader,
    states = [],
    sizes = SIZES,
    defaultSize = DEFAULT_SIZE,
    history,
  }: RootProps<TLoader>,
  forwardRef: Ref<RootRef<TLoader>>
) {
  let { data, set } = useSyncURL(historySchema);
  const historyMounted = useMemo(() => {
    return (
      data !== null &&
      Object.keys(data)
        .map((k) => data![k])
        .every((v) => v !== undefined)
    );
  }, [data]);

  const [state, setState] = useState<FetchState>({
    mount: false,
    loading: true,
    error: false,
    success: false,
  });

  const [params, setParams] = useState<LoaderParams>({
    page: 0,
    size: defaultSize ? VALID_SIZE(defaultSize, sizes) : sizes[0],
    order: new Map(),
  });

  const [res, setRes] = useState<LoaderData>({
    data: [],
    total: 0,
  });

  const load = async () => {
    setState((s) => ({
      ...s,
      loading: true,
    }));

    return loader(params, states)
      .then(setRes)
      .then(
        () =>
          history &&
          state.mount &&
          set({
            page: params.page,
            size: params.size,
            asc: Array.from(params.order)
              .filter(([_, d]) => d === "ascending")
              .map(([c, _]) => c),
            desc: Array.from(params.order)
              .filter(([_, d]) => d === "descending")
              .map(([c, _]) => c),
          })
      )
      .then(() =>
        setState({ mount: true, loading: false, success: true, error: false })
      )
      .catch(() =>
        setState({ mount: true, loading: false, success: false, error: true })
      );
  };

  const changeOrder = ([name, direction]: OrderItem) => {
    params.order.set(
      name,
      direction === "none"
        ? "ascending"
        : direction === "ascending"
        ? "descending"
        : "ascending"
    );
    params.page = 0;
    setParams({ ...params });
    load();
  };

  const changeSize = (size: number) => {
    params.page = Math.max(
      Math.min(
        params.size < size
          ? Math.ceil(((params.page + 1) * params.size) / size) - 1
          : Math.ceil(
              ((params.page + 1) * params.size) / size -
                Math.floor(params.size / size)
            ),
        res.total - 1
      ),
      0
    );
    params.size = size;
    setParams((params) => ({ ...params }));
    load();
  };

  const changePage = (page: number) => {
    params.page = page;
    setParams((params) => ({ ...params }));
    load();
  };

  useImperativeHandle(forwardRef, () => ({
    getData: () => res.data,
    getTotal: () => res.total,
    getOrder: () => params.order,
    getPage: () => params.page,
    getSize: () => params.size,
    // @ts-ignore
    refetch: async (sts) => {
      setState((s) => ({ ...s, loading: true }));
      return loader(params, sts || states)
        .then((result) => {
          setRes(result);
          history &&
            state.mount &&
            set({
              page: params.page,
              size: params.size,
              asc: Array.from(params.order)
                .filter(([_, d]) => d === "ascending")
                .map(([c, _]) => c),
              desc: Array.from(params.order)
                .filter(([_, d]) => d === "descending")
                .map(([c, _]) => c),
            });
          setState({
            mount: true,
            loading: false,
            success: true,
            error: false,
          });
          return result;
        })
        .catch(() =>
          setState({ mount: true, loading: false, success: false, error: true })
        );
    },
    getStates: () => states,
    changeOrder,
    changePage,
    changeSize,
    getState: () => state,
  }));

  useEffect(() => {
    // setParams to query params before loading

    if (!history) {
      setParams((p) => ({ ...p, page: 0 }));
      load();
    } else if (history && historyMounted) {
      if (state.mount) {
        setParams((p) => ({ ...p, page: 0 }));
        load();
      } else {
        const historyParams = mapHistory(data!);
        // React would not update before load()
        params.page = historyParams.page ?? 0;
        params.size = historyParams.size ?? params.size;
        params.order = historyParams.order?.size
          ? historyParams.order
          : params.order;
        // Update components
        setParams((p) => ({ ...historyParams, ...p }));
        load();
      }
    }
  }, [...states, historyMounted]);

  return (
    <ContextLoader.Provider value={res}>
      <ContextFetch.Provider value={state}>
        <ContextParams.Provider value={params}>
          <ContextSetter.Provider
            value={{
              changeOrder,
              changeSize,
              changePage,
            }}
          >
            <ContextRootParams.Provider value={{ sizes, defaultSize }}>
              {children}
            </ContextRootParams.Provider>
          </ContextSetter.Provider>
        </ContextParams.Provider>
      </ContextFetch.Provider>
    </ContextLoader.Provider>
  );
}

DataTable.Root = forwardRef(fowardedRoot);

type TableProps = {
  fallback?: () => JSX.Element;
} & ComponentProps<"table">;

DataTable.Table = ({ children, fallback, ...props }: TableProps) => {
  const { success, error, loading } = useContext(ContextFetch);
  const { data: datas, total } = useContext(ContextLoader);

  if (fallback)
    if (!(loading && !success && !error))
      if (error || (datas.length < 1 && total < 1 && success))
        return (
          <>
            <table {...props}>{children}</table>
            {fallback()}
          </>
        );

  return <table {...props}>{children}</table>;
};

DataTable.Header = ({ children, ...props }: ComponentProps<"thead">) => (
  <thead {...props}>
    <tr>{children}</tr>
  </thead>
);

const ContextCol = createContext<OrderItem | undefined>(undefined);

type ColProps = {
  name?: string;
} & ComponentProps<"th">;

DataTable.Col = ({ children, name, ...props }: ColProps) => {
  const { order } = useContext(ContextParams);
  const direction = name ? order.get(name) ?? "ascending" : "ascending";

  return (
    <th data-direction={direction} aria-sort={direction} {...props}>
      <ContextCol.Provider value={name ? [name, direction] : undefined}>
        {children}
      </ContextCol.Provider>
    </th>
  );
};

DataTable.Order = ({ children, ...props }: ComponentProps<"span">) => {
  const { changeOrder } = useContext(ContextSetter);
  const order = useContext(ContextCol);

  if (!order) {
    throw "DataTable.Order must be in a DataTable.Col with a name prop";
  }

  return (
    <span onClickCapture={() => changeOrder(order)} {...props}>
      {children}
    </span>
  );
};

type GetLoaderData<TLoader extends Loader> = Awaited<
  ReturnType<TLoader>
>["data"][number];

type BodyProps<TLoader extends Loader | Record<PropertyKey, any>[]> = {
  children: (
    data: TLoader extends Loader
      ? GetLoaderData<TLoader>
      : TLoader extends Record<PropertyKey, any>[]
      ? TLoader[number]
      : never
  ) => ReactNode;
} & Omit<ComponentProps<"tbody">, "children">;

DataTable.Body = function <
  TLoader extends Loader | Array<Record<PropertyKey, any>>
>({ children, ...props }: BodyProps<TLoader>) {
  const { data: datas } = useContext(ContextLoader);

  return (
    <tbody {...props}>
      {datas.map((data, index) => (
        <Fragment key={index}>{children(data as any)}</Fragment>
      ))}
    </tbody>
  );
};

DataTable.Row = ({ children, ...props }: ComponentProps<"tr">) => (
  <tr {...props}>{children}</tr>
);

DataTable.Data = ({ children, ...props }: ComponentProps<"td">) => (
  <td {...props}>{children}</td>
);

type SizeProps = Omit<ComponentProps<"select">, "children">;

DataTable.Size = ({ ...props }: SizeProps) => {
  const { changeSize } = useContext(ContextSetter);
  const { sizes } = useContext(ContextRootParams);
  const { size } = useContext(ContextParams);

  return (
    <select
      value={size}
      onChange={(e) => {
        changeSize(z.coerce.number().parse(e.target.value));
        props.onChange && props.onChange(e);
      }}
      {...props}
    >
      {sizes.map((size, index) => (
        <option key={index} value={size}>
          {size}
        </option>
      ))}
    </select>
  );
};

type PaginationProps = {
  length: number;
} & ComponentProps<"div">;

const ContextPagination = createContext<{
  total: number;
  current: number;
  size: number;
  pages: number;
  hasPrev: boolean;
  hasNext: boolean;
  length: number;
}>({
  total: 0,
  current: 0,
  size: 10,
  pages: 0,
  hasPrev: false,
  hasNext: false,
  length: 5,
});

const usePagination = () => {
  const { total } = useContext(ContextLoader);
  const { page: current, size } = useContext(ContextParams);

  const pages = Math.ceil(total / size);
  const hasNext = (current + 1) * size < total;
  const hasPrev = current > 0;

  return { total, current, size, pages, hasNext, hasPrev };
};

DataTable.Pagination = ({ length, children, ...props }: PaginationProps) => {
  const pagination = usePagination();

  return (
    <div
      data-has-next={pagination.hasNext}
      data-has-previous={pagination.hasPrev}
      data-pages={pagination.pages}
      {...props}
    >
      <ContextPagination.Provider value={{ ...pagination, length }}>
        {children}
      </ContextPagination.Provider>
    </div>
  );
};

type ArrowProps = (
  | {
      previous: true;
      next?: never;
      start?: never;
      end?: never;
    }
  | { next: true; previous?: never; start?: never; end?: never }
  | { next?: never; previous?: never; start: true; end?: never }
  | { next?: never; previous?: never; start?: never; end: true }
) & {} & ComponentProps<"button">;

DataTable.Arrow = ({
  children,
  previous,
  next,
  start,
  end,
  ...props
}: ArrowProps) => {
  const { changePage } = useContext(ContextSetter);
  const { hasNext, hasPrev, current, pages } = useContext(ContextPagination);
  const disable =
    Boolean(previous || start) && hasPrev
      ? false
      : Boolean(next || end) && hasNext
      ? false
      : true;

  return (
    <button
      disabled={disable}
      aria-disabled={disable}
      data-action={previous ? "previous" : "next"}
      onClick={(e) => {
        const newPage = start
          ? 0
          : end
          ? pages - 1
          : previous
          ? current - 1
          : current + 1;

        changePage(newPage);
        props.onChange && props.onChange(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

DataTable.Pages = ({
  ...props
}: Omit<ComponentProps<"button">, "children">) => {
  const { changePage } = useContext(ContextSetter);
  const { pages, current, length } = useContext(ContextPagination);
  return (
    <>
      {Array(pages < length ? pages : length)
        .fill(null)
        .map((_, i) =>
          pages < length
            ? i
            : current + 1 > pages - Math.floor(length / 2)
            ? pages - length + i
            : current + 1 > Math.ceil(length / 2)
            ? i + (current - 2)
            : i
        )
        .map((page) => {
          const isCurrent = page === current;
          return (
            <button
              aria-current={isCurrent}
              key={page}
              data-page={page + 1}
              data-current={isCurrent}
              {...props}
              onClick={(e) => {
                changePage(page);
                props.onChange && props.onChange(e);
              }}
            >
              {page + 1}
            </button>
          );
        })}
    </>
  );
};

DataTable.Total = ({ ...props }: Omit<ComponentProps<"span">, "children">) => {
  const { total } = useContext(ContextLoader);
  return <span {...props}>{total}</span>;
};

const historySchema = z
  .object({
    page: z.coerce.number().int().min(0),
    size: z.coerce.number().int().min(0),
    asc: z.union([z.string(), z.array(z.string())]),
    desc: z.union([z.string(), z.array(z.string())]),
  })
  .deepPartial();

type HistorySchema = z.infer<typeof historySchema>;

const mapHistory = (data: HistorySchema): Partial<LoaderParams> => ({
  page: data.page,
  size: data.size,
  order:
    data.asc || data.desc
      ? (data.asc ? (!Array.isArray(data.asc) ? [data.asc] : data.asc) : [])
          .map((value) => [value, "ascending"])
          .concat(
            (data.desc
              ? !Array.isArray(data.desc)
                ? [data.desc]
                : data.desc
              : []
            ).map((value) => [value, "descending"])
          )
          .reduce<Order>(
            (prev, [v, o]) => prev.set(v, o as OrderDir),
            new Map()
          )
      : new Map(),
});

export const {
  Root,
  Table,
  Header,
  Col,
  Order,
  Body,
  Row,
  Data,
  Size,
  Pagination,
  Arrow,
  Pages,
  Total,
  buildLoader,
} = DataTable;
