import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// All Google Drive scopes configured for the app
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không nhận được Access Token từ Google OAuth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

/**
 * Fetch Google Drive storage quota info
 */
export async function getDriveStorageQuota(): Promise<DriveStorageQuota | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota,user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.storageQuota || null;
  } catch (err) {
    console.warn('Failed to fetch Drive quota:', err);
    return null;
  }
}

/**
 * List study files saved in user's Google Drive
 */
export async function listDriveStudyFiles(searchTerm = ''): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối tài khoản Google Drive trước!');

  let query = "trashed = false";
  if (searchTerm && searchTerm.trim()) {
    query += ` and name contains '${searchTerm.replace(/'/g, "\\'")}'`;
  } else {
    // By default prioritize EDT related files or all files
    query += " and (name contains 'EDT' or name contains 'XSTK' or name contains 'Prompt' or mimeType = 'application/pdf' or mimeType = 'application/json')";
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&fields=files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,iconLink)&pageSize=30&orderBy=modifiedTime desc,createdTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Fallback: list all non-trashed files
    const fallbackUrl = `https://www.googleapis.com/drive/v3/files?q=trashed%20%3D%20false&fields=files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,iconLink)&pageSize=25&orderBy=modifiedTime desc`;
    const fbRes = await fetch(fallbackUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!fbRes.ok) {
      throw new Error(`Lỗi tải danh sách tệp Google Drive (HTTP ${response.status})`);
    }
    const fbData = await fbRes.json();
    return fbData.files || [];
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Upload a text or JSON file directly into user's Google Drive
 */
export async function uploadToGoogleDrive(
  fileName: string,
  content: string,
  mimeType = 'text/plain',
  folderId?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng đăng nhập Google để đồng bộ vào Drive!');

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType,
    description: 'Tài liệu học tập & Đề thi được tạo tự động bởi Ứng Dụng EDT XSTK & Kinh Tế Lượng',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Lỗi tải lên Google Drive (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * Delete a file from Google Drive (Requires explicit confirmation before calling)
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google Drive trước khi xóa tệp!');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Không thể xóa tệp (HTTP ${response.status})`);
  }

  return true;
}

/**
 * Create a dedicated study folder in Google Drive
 */
export async function createDriveFolder(folderName = 'EDT Study App - Tài Liệu & Đề Thi'): Promise<{ id: string; name: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Vui lòng kết nối Google Drive trước!');

  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    description: 'Thư mục lưu trữ bài giảng, đề thi và tổng hợp prompt của ứng dụng EDT',
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Không thể tạo thư mục trên Google Drive');
  }

  return response.json();
}
