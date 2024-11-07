"use client";

import { UploadCloud } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

interface FileUploadProps {
  value?: string;
  onUpload: (url: string) => void;
  className?: string;
  multiple?: boolean;
}

export function FileUpload({ value, onUpload, className, multiple = false }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        onUpload(data.url);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {value ? (
        <div className="relative w-full h-full min-h-[100px]">
          <Image
            src={value}
            alt="Uploaded file"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full min-h-[100px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {uploading ? "Uploading..." : "Click to upload"}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            multiple={multiple}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}