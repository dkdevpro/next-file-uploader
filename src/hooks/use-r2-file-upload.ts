"use client";

import * as React from "react";
import type { UploadedFile } from "@/types";
import { toast } from "sonner";
import { GetObjectCommand, DeleteObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { XhrHttpHandler } from "@aws-sdk/xhr-http-handler";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getErrorMessage } from "@/lib/error-handler";
import { formatBytes } from "@/lib/utils";

interface UseUploadFileProps {
  defaultUploadedFiles?: UploadedFile<File>[];
}

// upload file hook will do upload, update progress, and failure.

export function useR2UploadFile(
  endpoint: string, // Specify the endpoint URL for Cloudflare R2
  { defaultUploadedFiles = [] }: UseUploadFileProps = {},
) {
  const [uploadedFiles, setUploadedFiles] =
    React.useState<UploadedFile<File>[]>(defaultUploadedFiles);
  const [progresses, setProgresses] = React.useState<Record<string, number>>(
    {},
  );
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFiles(files: File[]) {
    setIsUploading(true);
    const uploadFiles: UploadedFile<File>[] = files.map((file: File) => {
      return {
        name: file.name,
        size: formatBytes(file.size),
        type: file.type,
        fileKey: "",
        url: "",
        data: file,
      };
    });
    setUploadedFiles((prev) =>
      prev ? [...prev, ...uploadFiles] : uploadFiles,
    );
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const s3 = new S3({
        region: "auto",
        endpoint: endpoint,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY!,
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        requestHandler: new XhrHttpHandler({}),
      });

      const uploadPromises: Promise<UploadedFile<File>>[] = uploadFiles
        .filter((file) => file.url.length <= 0)
        .map(async (uploadedFile: UploadedFile<File>) => {
          const file: File = uploadedFile.data;
          const file_key =
            "uploads/" + Date.now().toString() + file.name.replace(" ", "-");
          const params = {
            Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
            Key: file_key,
            Body: file,
            signatureVersion: "v4",
          };

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const upload = new Upload({
            client: s3,
            params,
          });

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          upload.on("httpUploadProgress", (e) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const loaded = e.loaded ?? 0;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const total = e.total ?? 0;
            const progress = (loaded / total) * 100;
            setProgresses((prev) => {
              return {
                ...prev,
                [file.name]: progress,
              };
            });
            console.log(Math.round(progress));
          });
          await upload.done();

          const signedUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
              Key: file_key,
            }),
            { expiresIn: 3600 },
          );
          uploadedFile.url = signedUrl;
          uploadedFile.fileKey = file_key;
          return uploadedFile;
        });
      const result: UploadedFile<File>[] = await Promise.all(uploadPromises);
      setUploadedFiles([...uploadedFiles, ...result]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploading(false);
      //setProgresses({});
    }
  }

  async function onDeleteFile(index: number) {
    console.log("onDelete", index);
    if (!uploadedFiles) return;
    try {
      const s3 = new S3({
        region: "auto",
        endpoint: endpoint,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY!,
        },
      });

      const uploadPromises: Promise<UploadedFile<File>>[] = uploadedFiles
        .filter((_, i) => i == index)
        .map(async (uploadedFile: UploadedFile<File>) => {
          const params = {
            Bucket: process.env.NEXT_PUBLIC_R2_BUCKET_NAME!,
            Key: uploadedFile.fileKey,
            signatureVersion: "v4",
          };
          const data = await s3.send(new DeleteObjectCommand(params));
          console.log("Success. Object deleted.", data);
          return uploadedFile;
        });
      const result: UploadedFile<File>[] = await Promise.all(uploadPromises);
      const newFiles = result.filter((_, i) => i !== index);
      setUploadedFiles(newFiles);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploading(false);
      //setProgresses({});
    }
  }

  return {
    uploadedFiles,
    progresses,
    uploadFiles: uploadFiles,
    isUploading,
    onRemove: onDeleteFile,
  };
}
