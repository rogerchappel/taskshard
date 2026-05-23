export interface BaseOptions {
  format?: string;
}

export interface Options extends BaseOptions {
  output?: string;
  conflicts?: boolean;
}

export interface WriteCommandOptions {
  out: string;
  prefix?: string;
  format?: string;
}
