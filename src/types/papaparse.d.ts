declare module "papaparse" {
  export function parse<T = any>(
    csv: string,
    config?: any
  ): { data: T[]; errors?: any[]; meta?: any };
  export function unparse(data: any, config?: any): string;
  const _default: {
    parse: typeof parse;
    unparse: typeof unparse;
  };
  export default _default;
}
