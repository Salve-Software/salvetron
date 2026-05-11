/**
 * Read Blob as text using FileReader
 */
export function readBlobAsText(blob: Blob): Promise<string | undefined> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(undefined);
    reader.readAsText(blob);
  });
}
