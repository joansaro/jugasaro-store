'use client';

import { Button } from '@/components/ui/button';

/** Imprime la página — el diálogo del navegador permite "Guardar como PDF". */
export function PrintButton() {
  return (
    <>
      <Button variant="outline" onClick={() => history.back()}>
        ← Back
      </Button>
      <Button onClick={() => window.print()}>Print / Save as PDF</Button>
    </>
  );
}
