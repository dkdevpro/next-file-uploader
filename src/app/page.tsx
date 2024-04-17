"use client";

import { FileUploader } from "@/components/r2-file-uploader";
import { Shell } from "@/components/shell";
import { UploadedFilesCard } from "@/components/uploaded-files-card";
import { useR2UploadFile } from "@/hooks/use-r2-file-upload";

import React from "react";

export default function HomePage() {
  const { uploadFiles, uploadedFiles, isUploading, onRemove, progresses } =
    useR2UploadFile(
      `https://${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      {
        defaultUploadedFiles: [],
      },
    );

  return (
    <Shell>
      <div className="flex-row gap-y-6">
        <div className="mt-4">
          <FileUploader
            maxFiles={4}
            maxSize={4 * 1024 * 1024}
            onUpload={async (files: File[]) => {
              await uploadFiles(files);
            }}
            disabled={isUploading}
          />
        </div>
        <div className="mt-4">
          <UploadedFilesCard
            uploadedFiles={uploadedFiles}
            onRemove={onRemove}
            progresses={progresses}
          />
        </div>
      </div>
    </Shell>
  );
}
