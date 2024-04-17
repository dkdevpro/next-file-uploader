export interface UploadedFile<T = unknown> {
  name: string;
  size: string;
  type: string;
  url: string;
  fileKey: string;
  data: T;
}
