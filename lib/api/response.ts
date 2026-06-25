import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function paginated<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
) {
  return NextResponse.json({ data, pagination }, { status: 200 });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(message: string, status = 400, fieldErrors?: Record<string, string[]>) {
  return NextResponse.json({ error: { message, fieldErrors } }, { status });
}
