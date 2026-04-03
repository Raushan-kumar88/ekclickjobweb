import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

/**
 * Upload a resume file to Firebase Storage.
 * Returns { downloadURL, storagePath }.
 * Progress is reported via the onProgress callback (0–100).
 */
export async function uploadResume(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<{ downloadURL: string; storagePath: string }> {
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `resumes/${userId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "application/pdf",
    });

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        resolve({ downloadURL, storagePath: path });
      }
    );
  });
}

/**
 * Upload a verification document (PDF/JPG/PNG) to Firebase Storage.
 * Returns { downloadURL, storagePath, fileName }.
 */
export async function uploadVerificationDocument(
  file: File,
  userId: string,
  docType: string,
  onProgress?: (pct: number) => void
): Promise<{ downloadURL: string; storagePath: string; fileName: string }> {
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `verifications/${userId}/${docType}-${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "application/octet-stream",
    });

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        resolve({ downloadURL, storagePath: path, fileName: file.name });
      }
    );
  });
}

/**
 * Upload a company logo to Firebase Storage.
 * Returns the public download URL.
 */
export async function uploadCompanyLogo(
  file: File,
  companyId: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `companies/${companyId}/logo.${ext}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "image/jpeg",
    });

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/** Delete a previously uploaded resume by its storage path. */
export async function deleteResume(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // Ignore "not found" errors
  }
}

/**
 * Upload a profile photo to Firebase Storage.
 * Overwrites any previous photo for this user.
 * Returns the public download URL.
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `avatars/${userId}/photo.${ext}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "image/jpeg",
    });

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
