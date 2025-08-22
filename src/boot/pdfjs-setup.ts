// pdfjs-setup.ts (import this once in your app entry)
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set workerSrc with proper type assertion
(
  pdfjsLib as typeof pdfjsLib & { GlobalWorkerOptions: { workerSrc: string } }
).GlobalWorkerOptions.workerSrc = workerUrl;

export { pdfjsLib };
