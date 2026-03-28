import { fetchJson } from "@/lib/api/http";
import type { Product } from "@/types/product";

export interface CreateProductPayload {
  readonly name: string;
  readonly barcode: string;
  readonly description?: string;
}

export interface UpdateProductPayload {
  readonly name?: string;
  readonly barcode?: string;
  readonly description?: string;
}

export async function listProducts(): Promise<Product[]> {
  return fetchJson<Product[]>("/products");
}

export async function getProduct(id: string): Promise<Product> {
  return fetchJson<Product>(`/products/${encodeURIComponent(id)}`);
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  return fetchJson<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<Product> {
  return fetchJson<Product>(`/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchJson<void>(`/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
