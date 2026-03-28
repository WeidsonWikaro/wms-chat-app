"use client";

import type { FormEvent, ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiBaseUrl } from "@/lib/api/config";
import { fetchHealth } from "@/lib/api/health-client";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "@/lib/api/products-client";
import type { Product } from "@/types/product";

export function ApiDemoClient(): ReactElement {
  const [health, setHealth] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const refreshList = useCallback(async (): Promise<void> => {
    setListError(null);
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load products.";
      setListError(message);
    }
  }, []);

  const refreshHealth = useCallback(async (): Promise<void> => {
    setHealthError(null);
    try {
      const data = await fetchHealth();
      setHealth(`${data.service} — ${data.timestamp}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Health check failed.";
      setHealthError(message);
      setHealth(null);
    }
  }, []);

  useEffect(() => {
    void refreshHealth();
    void refreshList();
  }, [refreshHealth, refreshList]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedName = name.trim();
      const trimmedBarcode = barcode.trim();
      if (trimmedName.length === 0) {
        return;
      }
      if (!editingId && trimmedBarcode.length === 0) {
        return;
      }
      setLoading(true);
      setListError(null);
      try {
        if (editingId) {
          await updateProduct(editingId, {
            name: trimmedName,
            barcode:
              trimmedBarcode.length > 0 ? trimmedBarcode : undefined,
            description,
          });
          setEditingId(null);
        } else {
          await createProduct({
            name: trimmedName,
            barcode: trimmedBarcode,
            description: description.trim() || undefined,
          });
        }
        setName("");
        setBarcode("");
        setDescription("");
        await refreshList();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Request failed.";
        setListError(message);
      } finally {
        setLoading(false);
      }
    },
    [barcode, description, editingId, name, refreshList]
  );

  const handleEdit = useCallback(async (product: Product) => {
    setListError(null);
    setName(product.name);
    setBarcode(product.barcode);
    setDescription(product.description ?? "");
    setEditingId(product.id);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setName("");
    setBarcode("");
    setDescription("");
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setLoading(true);
      setListError(null);
      try {
        await deleteProduct(id);
        if (editingId === id) {
          handleCancelEdit();
        }
        await refreshList();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Delete failed.";
        setListError(message);
      } finally {
        setLoading(false);
      }
    },
    [editingId, handleCancelEdit, refreshList]
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <nav
          className="flex flex-wrap gap-4 text-sm text-muted-foreground"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Chat
          </Link>
          <span aria-hidden className="text-border">
            /
          </span>
          <span className="font-medium text-foreground">API demo</span>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle>Backend connection</CardTitle>
            <CardDescription>
              Target base URL:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {getApiBaseUrl()}
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">GET /health</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refreshHealth()}
              >
                Retry
              </Button>
            </div>
            {health ? (
              <p className="text-emerald-600 dark:text-emerald-400" role="status">
                {health}
              </p>
            ) : null}
            {healthError ? (
              <p className="text-destructive" role="alert">
                {healthError}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Example CRUD (products)</CardTitle>
            <CardDescription>
              Products stored in PostgreSQL via the Nest API. Barcode must be
              unique.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="product-name">
                  Name
                </label>
                <Input
                  id="product-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="product-barcode">
                  Barcode
                  {editingId ? (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      (leave blank to keep current on update)
                    </span>
                  ) : null}
                </label>
                <Input
                  id="product-barcode"
                  name="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="E.g. 7891234567890"
                  required={!editingId}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="product-desc">
                  Description (optional)
                </label>
                <Textarea
                  id="product-desc"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details"
                  disabled={loading}
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={loading}>
                  {editingId ? "PUT — Update product" : "POST — Create product"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel edit
                  </Button>
                ) : null}
              </div>
            </form>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  GET — List products
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void refreshList()}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              {listError ? (
                <p className="text-sm text-destructive" role="alert">
                  {listError}
                </p>
              ) : null}
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products yet.</p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border/80">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Barcode: {product.barcode}
                        </p>
                        {product.description ? (
                          <p className="text-sm text-muted-foreground">
                            {product.description}
                          </p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          {product.id}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => void handleEdit(product)}
                          disabled={loading}
                        >
                          Edit (PUT)
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleDelete(product.id)}
                          disabled={loading}
                        >
                          DELETE
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Streaming chat will use a dedicated module later; this page only
            exercises REST against the Nest API.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
