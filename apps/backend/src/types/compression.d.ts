declare module "compression" {
  import type { RequestHandler } from "express";

  export interface CompressionOptions {
    filter?: RequestHandler;
  }

  export default function compression(options?: CompressionOptions): RequestHandler;
}
