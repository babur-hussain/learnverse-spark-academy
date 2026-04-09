import React, { useEffect, useRef } from 'react';
// Vite will emit the worker asset; we use its URL for workerSrc
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface SimplePDFCanvasProps {
  url: string;
  className?: string;
}

// Minimal PDF.js canvas viewer that renders all pages vertically
const SimplePDFCanvas: React.FC<SimplePDFCanvasProps> = ({ url, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTasksRef = useRef<any[]>([]);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl as string;

      const loadingTask = (pdfjsLib as any).getDocument(url);
      const pdf = await loadingTask.promise;

      const container = containerRef.current;
      if (!container) return;

      // Clear previous
      container.innerHTML = '';
      renderTasksRef.current.forEach((t) => t?.cancel?.());
      renderTasksRef.current = [];

      const width = container.clientWidth || window.innerWidth;
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (isCancelled) break;
        const page = await pdf.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.max(0.5, Math.min(3, width / baseViewport.width));
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto 16px auto';
        const context = canvas.getContext('2d');
        // Set canvas size accounting for device pixel ratio to avoid blur on mobile
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        // Scale the drawing context so 1 unit = 1 CSS pixel
        if (context) {
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        container.appendChild(canvas);

        const renderContext = { canvasContext: context as any, viewport };
        const renderTask = page.render(renderContext);
        renderTasksRef.current.push(renderTask);
        try {
          await renderTask.promise;
        } catch (err: any) {
          if (err?.name !== 'RenderingCancelledException') {
            // Keep going even if a page fails
            // eslint-disable-next-line no-console
            console.error('PDF render error', err);
          }
        }
      }
    })();

    return () => {
      isCancelled = true;
      renderTasksRef.current.forEach((t) => t?.cancel?.());
      renderTasksRef.current = [];
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [url]);

  return (
    <div ref={containerRef} className={className} style={{ height: '100%', width: '100%', overflow: 'auto', background: 'var(--background)' }} />
  );
};

export default SimplePDFCanvas;


