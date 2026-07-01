"use client";

import React, { useRef, useState } from "react";
import { Upload, Loader2, FileUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Prop types mimicking UploadThing's API
export interface UploadProps {
  endpoint: "mediaUploader" | "documentUploader";
  onClientUploadComplete?: (
    res: Array<{
      name: string;
      size: number;
      key: string;
      ufsUrl: string;
      url: string;
    }>
  ) => void;
  onUploadError?: (err: Error) => void;
  onUploadBegin?: (fileName?: string) => void;
  appearance?: {
    button?: string;
    allowedContent?: string;
    container?: string;
  };
}

// XHR upload function to track progress
function uploadFileWithProgress(
  file: File,
  uploadUrl: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

// Common file processing helper
async function processUpload(
  files: FileList,
  endpoint: "mediaUploader" | "documentUploader",
  onProgress: (percent: number, currentFile: string) => void,
  onUploadBegin?: (fileName?: string) => void
) {
  const folder = endpoint === "mediaUploader" ? "general" : "documents";
  const uploadedResults = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onUploadBegin) {
      onUploadBegin(file.name);
    }

    onProgress(0, file.name);

    // 1. Get presigned URL from API
    const presignRes = await fetch("/api/media/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folder,
      }),
    });

    if (!presignRes.ok) {
      const errData = await presignRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Failed to get upload authorization");
    }

    const { data: { uploadUrl, fileKey, publicUrl } } = await presignRes.json();

    // 2. Upload file to R2 via presigned URL
    await uploadFileWithProgress(file, uploadUrl, (percent) => {
      onProgress(percent, file.name);
    });

    // 3. Register file in database
    const registerRes = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        filePath: publicUrl,
        fileKey: fileKey,
        fileType: file.type,
        fileSize: file.size,
        folder,
      }),
    });

    if (!registerRes.ok) {
      const errData = await registerRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Failed to save file metadata");
    }

    const { data: registeredMedia } = await registerRes.json();
    
    uploadedResults.push({
      name: registeredMedia.fileName,
      size: registeredMedia.fileSize,
      key: registeredMedia.fileKey,
      ufsUrl: registeredMedia.filePath,
      url: registeredMedia.filePath,
    });
  }

  return uploadedResults;
}

export function UploadButton({
  endpoint,
  onClientUploadComplete,
  onUploadError,
  onUploadBegin,
  appearance,
}: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    try {
      const res = await processUpload(
        files,
        endpoint,
        (percent, file) => {
          setProgress(percent);
          setCurrentFile(file);
        },
        onUploadBegin
      );
      if (onClientUploadComplete) {
        onClientUploadComplete(res);
      }
    } catch (err: any) {
      console.error(err);
      if (onUploadError) {
        onUploadError(err);
      } else {
        toast.error(err.message || "Upload failed");
      }
    } finally {
      setIsUploading(false);
      setProgress(0);
      setCurrentFile("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const allowedTypesText =
    endpoint === "mediaUploader"
      ? "Gambar (JPEG, PNG, WEBP) maks 4MB"
      : "Dokumen (PDF, Excel, Word, TXT, CSV) maks 8MB";

  return (
    <div className={cn("flex flex-col items-center gap-1", appearance?.container)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept={endpoint === "mediaUploader" ? "image/*" : ".pdf,.txt,.csv,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.rtf"}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          appearance?.button
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {progress < 100 ? `Memuat naik... ${progress}%` : "Mendaftarkan..."}
          </>
        ) : (
          <>
            <FileUp className="mr-2 h-4 w-4" />
            Pilih Fail
          </>
        )}
      </button>
      {appearance?.allowedContent !== "hidden" && (
        <span className={cn("text-xs text-muted-foreground", appearance?.allowedContent)}>
          {allowedTypesText}
        </span>
      )}
    </div>
  );
}

export function UploadDropzone({
  endpoint,
  onClientUploadComplete,
  onUploadError,
  onUploadBegin,
  appearance,
}: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    try {
      const res = await processUpload(
        files,
        endpoint,
        (percent, file) => setProgress(percent),
        onUploadBegin
      );
      if (onClientUploadComplete) {
        onClientUploadComplete(res);
      }
    } catch (err: any) {
      console.error(err);
      if (onUploadError) {
        onUploadError(err);
      } else {
        toast.error(err.message || "Upload failed");
      }
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const allowedTypesText =
    endpoint === "mediaUploader"
      ? "Gambar (JPEG, PNG, WEBP) maks 4MB"
      : "Dokumen (PDF, Excel, Word, TXT, CSV) maks 8MB";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200 cursor-pointer",
        isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-muted/10 hover:bg-muted/20",
        isUploading && "pointer-events-none opacity-60",
        appearance?.container
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        multiple
        accept={endpoint === "mediaUploader" ? "image/*" : ".pdf,.txt,.csv,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.rtf"}
      />
      <div className="flex flex-col items-center justify-center space-y-2">
        {isUploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : (
          <Upload className="h-10 w-10 text-muted-foreground" />
        )}
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">
            {isUploading
              ? progress < 100
                ? `Memuat naik... ${progress}%`
                : "Mendaftarkan fail..."
              : "Seret & lepas fail di sini, atau klik untuk pilih"}
          </p>
          <p className="text-xs text-muted-foreground">{allowedTypesText}</p>
        </div>
      </div>
      {isUploading && (
        <div className="mt-4 w-full max-w-xs bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
