export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Generates SHA-1 signature for Cloudinary REST API.
 * Sorts parameters alphabetically, appends API secret, and returns hex string.
 */
async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');
  const stringToSign = `${serialized}${apiSecret}`;

  const msgUint8 = new TextEncoder().encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates an image file's existence, MIME type, and size limit.
 */
export function validateImageFile(file: unknown): File {
  if (!file || !(file instanceof File)) {
    throw new Error('No image file provided in request body');
  }

  if (!file.type || !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new Error('Unsupported image format. Allowed formats: image/jpeg, image/png, image/webp, image/gif');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum limit of 10 MB`);
  }

  return file;
}

/**
 * Uploads an image file to Cloudinary using signed authentication.
 */
export async function uploadToCloudinary(
  file: File,
  config: CloudinaryConfig,
  folder = 'silvys-kitchen/products',
  publicId?: string
): Promise<CloudinaryUploadResult> {
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error('Cloudinary environment credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or unconfigured');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsToSign: Record<string, string> = {
    folder,
    timestamp,
  };

  if (publicId) {
    const cleanPublicId = publicId.startsWith(folder + '/')
      ? publicId.substring(folder.length + 1)
      : publicId;
    paramsToSign['public_id'] = cleanPublicId;
  }

  const signature = await generateSignature(paramsToSign, config.apiSecret);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', config.apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  if (paramsToSign['public_id']) {
    formData.append('public_id', paramsToSign['public_id']);
  }
  formData.append('signature', signature);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

  const response = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: formData,
  });

  const responseData = (await response.json()) as any;

  if (!response.ok || responseData.error) {
    const errorMsg = responseData.error?.message || `HTTP ${response.status}: Failed to upload to Cloudinary`;
    throw new Error(`Cloudinary upload failed: ${errorMsg}`);
  }

  return {
    secure_url: responseData.secure_url,
    public_id: responseData.public_id,
    format: responseData.format,
    bytes: responseData.bytes,
    width: responseData.width,
    height: responseData.height,
  };
}
