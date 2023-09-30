export class RecordMap<K = any, V = any> {
  private records: { key: K; value: V }[] = [];
  constructor(iterable?: Iterable<readonly [K, V]> | null | undefined) {
    if (iterable) {
      const iterator = iterable[Symbol.iterator]();
      let result = iterator.next();
      while (!result.done) {
        const [key, value] = result.value;
        this.set(key, value);
        result = iterator.next();
      }
    }
  }

  get(key: K): V[] {
    return this.records
      .filter(({ key: k }) => k === key)
      .map(({ value: v }) => v);
  }

  set(key: K, value: V): RecordMap<K, V> {
    this.records.push({ key, value });
    return this;
  }

  has(key: K): boolean;
  has(key: K, value: V): boolean;
  has(key: K, value?: V): boolean {
    if (arguments.length === 1)
      return (
        this.records.length > 0 && this.records.some(({ key: k }) => k === key)
      );
    else
      return (
        this.records.length > 0 &&
        this.records.some(({ key: k, value: v }) => k === key && v === value)
      );
  }

  clear() {
    this.records = [];
  }

  delete(key: K): boolean;
  delete(key: K, value: V): boolean;
  delete(key: K, value?: V): boolean {
    if (!this.has(key)) return false;
    if (arguments.length === 1)
      this.records = this.records.filter(({ key: k }) => k === key);
    else
      this.records = this.records.filter(
        ({ key: k, value: v }) => k === key && v === value
      );
    return true;
  }

  forEach(callbackfn: (value: V, key: K, map: RecordMap<K, V>) => void) {
    return this.records.forEach(({ key, value }) =>
      callbackfn(value, key, this)
    );
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    let index = 0;

    return {
      next: () => {
        if (index < this.records.length) {
          const { key, value } = this.records[index++];
          return { value: [key, value], done: false };
        } else {
          return { done: true, value: undefined };
        }
      },
    };
  }
}

const x = new RecordMap(new RecordMap());
