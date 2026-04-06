import { useState } from 'react';
import { BarcodeProduct, lookupBarcode } from '@/services/barcode-lookup';

type State = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

type UseBarcodeLookupResult = {
  lookup: (barcode: string) => Promise<void>;
  product: BarcodeProduct | null;
  state: State;
  reset: () => void;
};

export function useBarcodeLookup(): UseBarcodeLookupResult {
  const [state, setState]     = useState<State>('idle');
  const [product, setProduct] = useState<BarcodeProduct | null>(null);

  async function lookup(barcode: string) {
    setState('loading');
    setProduct(null);
    try {
      const result = await lookupBarcode(barcode);
      if (result) {
        setProduct(result);
        setState('found');
      } else {
        setState('not_found');
      }
    } catch {
      setState('error');
    }
  }

  function reset() {
    setState('idle');
    setProduct(null);
  }

  return { lookup, product, state, reset };
}
