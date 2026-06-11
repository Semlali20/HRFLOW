/**
 * Triggers a browser file download from a Blob.
 * @param blob     - The file content as a Blob
 * @param filename - The suggested filename for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

/**
 * Returns today's date as an ISO string (YYYY-MM-DD) for use in filenames.
 */
export function todayDateString(): string {
    return new Date().toISOString().slice(0, 10);
}
