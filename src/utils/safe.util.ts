// utils/safe.ts
import { Result } from "@carbonteq/fp";

export function safe<T>(fn: () => T, errorMessage = "Unknown error"): Result<T, string> {
  try {
    const result = fn();
    return Result.Ok(result);
  } catch (err: any) {
    return Result.Err(err?.message ?? errorMessage);
  }
}
