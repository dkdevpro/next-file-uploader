import Image from "next/image";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyCard } from "@/components/empty-upload-placeholder";
import {
  DownloadIcon,
  CopyIcon,
  Cross2Icon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { type UploadedFile } from "@/types";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react";

interface UploadedFilesCardProps {
  uploadedFiles: UploadedFile<File>[];
  onRemove(index: number): void;
  progresses: Record<string, number>;
}

export function UploadedFilesCard({
  uploadedFiles,
  onRemove,
  progresses,
}: UploadedFilesCardProps) {
  return (
    <Card className="flex">
      {uploadedFiles.length > 0 ? (
        <ScrollArea className="h-fit w-full px-3">
          <div
            className="space-y-4  overflow-y-auto pb-2 pt-2"
            style={{ maxHeight: "calc(100vh - 370px)" }}
          >
            {uploadedFiles?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => onRemove(index)}
                progress={progresses[file.name]}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <EmptyCard
          title="No files uploaded"
          description="Upload some files to see and download them here"
          className="w-full"
        />
      )}
    </Card>
  );
}

interface FileCardProps {
  file: UploadedFile<File>;
  onRemove: () => void;
  progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name; // You can specify the filename here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative flex items-center space-x-4">
      <div className="flex flex-1 space-x-4">
        {isFileWithPreview(file.data) ? (
          <Image
            src={file.data.preview}
            alt={file.name}
            width={48}
            height={48}
            loading="lazy"
            className="aspect-square shrink-0 rounded-md object-cover"
          />
        ) : null}
        <div className="flex w-full flex-col gap-2">
          <div className="space-y-px">
            <p className="line-clamp-1 text-sm font-medium text-foreground/80">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">{file.size}</p>
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => handleDownload(file.url, file.name)}
        >
          <DownloadIcon className="size-4 " aria-hidden="true" />
          <span className="sr-only">Download file</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => onRemove()}
        >
          <Cross2Icon className="size-4 " aria-hidden="true" />
          <span className="sr-only">Remove file</span>
        </Button>

        {/* <Button type="button" variant="outline" size="icon" className="size-7">
          <CopyToClipboard text={file.url} onCopy={handleCopy}>
            {copied ? (
              <CheckIcon className="size-4 " aria-hidden="true" />
            ) : (
              <CopyIcon className="size-4 " aria-hidden="true" />
            )}
          </CopyToClipboard>
          <span className="sr-only">Copy link</span>
        </Button> */}
      </div>
    </div>
  );
}
function isFileWithPreview(file: File): file is File & { preview: string } {
  return "preview" in file && typeof file.preview === "string";
}
