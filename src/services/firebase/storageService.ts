/**
 * Firebase Storage Service
 *
 * Dosya yükleme/indirme + URL cache.
 * Content (ses, resim, animasyon) ve avatar dosyaları için.
 */

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type StorageReference,
} from 'firebase/storage';

import { storage } from './app';

// URL cache — aynı path için tekrar network çağrısı yapmaz
const urlCache = new Map<string, string>();

/**
 * Verilen Storage path'i için download URL döndürür.
 * Sonucu cache'e alır — aynı oturumda tekrar çağırılırsa cache'den döner.
 */
export async function getFileUrl(path: string): Promise<string> {
  const cached = urlCache.get(path);
  if (cached) return cached;

  const fileRef = ref(storage, path);
  const url = await getDownloadURL(fileRef);
  urlCache.set(path, url);
  return url;
}

/**
 * Content (ses/resim) dosyası URL'si.
 * path: örn. "content/audio/animals/cat.mp3"
 */
export async function getContentUrl(contentPath: string): Promise<string> {
  return getFileUrl(`content/${contentPath}`);
}

/**
 * Lottie animasyon dosyası URL'si.
 * path: örn. "nova_hatch.json"
 */
export async function getAnimationUrl(animationPath: string): Promise<string> {
  return getFileUrl(`animations/${animationPath}`);
}

/**
 * Avatar URL'si.
 * userId ve fileName ile path oluşturur.
 */
export async function getAvatarUrl(userId: string, fileName: string): Promise<string> {
  return getFileUrl(`avatars/${userId}/${fileName}`);
}

/**
 * Kullanıcı avatar dosyası yükler.
 * Max 2MB, sadece image/* (storage rules tarafından da enforce edilir).
 */
export async function uploadAvatar(userId: string, fileName: string, file: Blob): Promise<string> {
  const avatarRef = ref(storage, `avatars/${userId}/${fileName}`);
  await uploadBytes(avatarRef, file, { contentType: file.type });

  const url = await getDownloadURL(avatarRef);
  urlCache.set(`avatars/${userId}/${fileName}`, url);
  return url;
}

/**
 * Avatar dosyasını siler.
 */
export async function deleteAvatar(userId: string, fileName: string): Promise<void> {
  const avatarRef = ref(storage, `avatars/${userId}/${fileName}`);
  await deleteObject(avatarRef);
  urlCache.delete(`avatars/${userId}/${fileName}`);
}

/**
 * URL cache'i temizler (logout sonrası kullanılır).
 */
export function clearUrlCache(): void {
  urlCache.clear();
}

/**
 * Belirtilen path için StorageReference döndürür.
 * İleri düzey kullanım için (listAll, metadata, vb.)
 */
export function getStorageRef(path: string): StorageReference {
  return ref(storage, path);
}
