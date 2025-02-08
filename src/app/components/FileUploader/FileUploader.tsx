"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { storage, ID } from "@/lib/appwrite"; // Adjust path accordingly
import Tesseract from "tesseract.js";

export function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setFiles(files);
    setLoading(true);

    try {
      // Upload file to Appwrite Storage
      const response = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string, // Ensure it's set in .env.local
        ID.unique(), // Generates a unique ID
        files[0]
      );

      // Get file preview URL
      const fileId = response.$id;
      const url = storage.getFileView(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string, fileId).toString();
      setFileUrl(url);
      
      console.log("Uploaded file:", response);
      console.log("File URL:", url);

      // Perform OCR with Tesseract.js
      const { data } = await Tesseract.recognize(url, "eng", {
        logger: (m) => console.log(m), // Logs OCR progress
      });

      setExtractedText(data.text);
    } catch (error) {
      console.error("File upload or OCR error:", error);
      setExtractedText("Error processing file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-32 w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <FileUpload onChange={handleFileUpload} />

      {loading && <p className="text-center text-gray-600 mt-4">Processing OCR...</p>}

      {fileUrl && (
        <div className="mt-4">
          <p>File Uploaded Successfully!</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            View File
          </a>
        </div>
      )}

      {extractedText && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Extracted Text:</h2>
          <p className="bg-gray-900 p-2 rounded-lg">{extractedText}</p>
        </div>
      )}
    </div>
  );
}
