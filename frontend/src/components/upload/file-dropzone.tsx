"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { uploadDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Document } from "@/types";

interface FileDropzoneProps {
  onUploadComplete: (document: Document) => void;
}

export function FileDropzone({ onUploadComplete }: FileDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setError(null);
      setProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const document = await uploadDocument(file);
        clearInterval(progressInterval);
        setProgress(100);

        // Delay nhỏ để user thấy 100%
        setTimeout(() => {
          onUploadComplete(document);
        }, 500);
      } catch (err) {
        clearInterval(progressInterval);
        setError(
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi upload. Vui lòng thử lại."
        );
        setUploading(false);
        setProgress(0);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          [".pptx"],
        "application/vnd.ms-powerpoint": [".ppt"],
      },
      maxFiles: 1,
      disabled: uploading,
    });

  const selectedFile = acceptedFiles[0];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all",
          isDragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary-100 p-4">
              <Upload className="h-8 w-8 animate-pulse text-primary-600" />
            </div>
            <div className="w-full max-w-xs">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Đang tải lên...
              </p>
              <Progress value={progress} showLabel color="primary" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary-100 p-4">
              <Upload className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive
                  ? "Thả file vào đây..."
                  : "Kéo thả file vào đây hoặc click để chọn"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Hỗ trợ: PDF, PowerPoint (PPTX) • Tối đa 20MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected file info */}
      {selectedFile && !uploading && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <FileText className="h-8 w-8 text-primary-500" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-success-500" />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-danger-500/20 bg-danger-50 p-4">
          <AlertCircle className="h-5 w-5 text-danger-500" />
          <p className="text-sm text-danger-600">{error}</p>
        </div>
      )}
    </div>
  );
}
