import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export interface OcrImageReaderProps {
  onTextExtracted?: (text: string) => void;
}

/** Lets a user select an image and extracts readable text with Tesseract.js. */
export function OcrImageReader({ onTextExtracted }: OcrImageReaderProps) {
  const [status, setStatus] = useState('Choose an image to extract its text.');
  const [text, setText] = useState('');

  const recognize = async (file: File) => {
    setStatus('Reading image…');
    try {
      const worker = await createWorker('eng');
      const result = await worker.recognize(file);
      await worker.terminate();
      const extracted = result.data.text.trim();
      setText(extracted);
      setStatus(extracted ? 'Text extracted.' : 'No readable text found.');
      onTextExtracted?.(extracted);
    } catch {
      setStatus('Could not read this image. Try a clearer image with readable text.');
    }
  };

  return (
    <section className="a11y-ocr-reader" aria-label="Image text reader">
      <label>
        Read text from an image
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void recognize(file);
          }}
        />
      </label>
      <p aria-live="polite">{status}</p>
      {text && <textarea aria-label="Extracted text" value={text} readOnly rows={6} />}
    </section>
  );
}
