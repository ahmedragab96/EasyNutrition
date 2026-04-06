/**
 * Barcode lookup via Open Food Facts API.
 * Free, no API key, ~3.5M products worldwide.
 * All nutrition values returned are per 100g/100ml.
 */

export type BarcodeProduct = {
  name: string;
  brand?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  /** Always 100 — OFF returns per-100g values */
  servingSize: number;
  servingUnit: string;
};

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  const url =
    `https://world.openfoodfacts.net/api/v2/product/${barcode}` +
    `?fields=product_name,brands,nutriments,serving_size`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'EasyNutrition/1.0 (nutrition tracking app)' },
  });

  if (!res.ok) throw new Error(`Network error: ${res.status}`);

  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;

  const p = json.product;
  const n = p.nutriments ?? {};

  const name = (p.product_name ?? '').trim();
  if (!name) return null;

  return {
    name,
    brand: p.brands ? p.brands.split(',')[0].trim() : undefined,
    kcal:    Math.round(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
    protein: Math.round((n['proteins_100g']      ?? 0) * 10) / 10,
    carbs:   Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
    fats:    Math.round((n['fat_100g']           ?? 0) * 10) / 10,
    servingSize: 100,
    servingUnit: 'g',
  };
}
