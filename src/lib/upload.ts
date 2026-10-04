import { refreshSession } from "./refresh";

export async function uploadAttachment(
  id: string,
  file: File,
  progress: (percent: number) => void,
) {
  const send = () =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const body = new FormData();
      body.append("file", file);
      xhr.open(
        "POST",
        `/api/backend/complaints/${encodeURIComponent(id)}/attachments`,
      );
      xhr.timeout = 30000;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable)
          progress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) return resolve();
        let message = "Upload failed. Please try again.";
        try {
          message = JSON.parse(xhr.responseText).message || message;
        } catch {
          /* An upstream proxy may return HTML. */
        }
        reject(Object.assign(new Error(message), { status: xhr.status }));
      };
      xhr.onerror = () =>
        reject(new Error("Upload failed. Check your connection."));
      xhr.ontimeout = () =>
        reject(new Error("Upload timed out. Please try again."));
      xhr.onabort = () => reject(new Error("Upload cancelled."));
      xhr.send(body);
    });
  try {
    await send();
  } catch (error) {
    if ((error as { status?: number }).status !== 401) throw error;
    if (!(await refreshSession()))
      throw new Error("Your session expired. Sign in before uploading again.");
    progress(0);
    await send();
  }
}
