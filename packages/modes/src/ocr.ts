export interface OcrRecognizer {
  recognize(source: File | Blob | string): Promise<string>;
}

/**
 * OCR is dependency-injected so hosts can choose Tesseract.js, a service, or a
 * native recognizer without adding a large OCR engine to every installation.
 */
export function createImageOcr(recognizer: OcrRecognizer) {
  return {
    extractText: (source: File | Blob | string) => recognizer.recognize(source),
  };
}
