import type { FieldValues, UseFormSetError } from "react-hook-form";
import { FetchError } from "@/lib/fetcher";

export function setFormErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): boolean {
  if (err instanceof FetchError && err.fieldErrors) {
    for (const [field, messages] of Object.entries(err.fieldErrors)) {
      setError(field as never, { message: messages[0] });
    }
    return true;
  }
  return false;
}
