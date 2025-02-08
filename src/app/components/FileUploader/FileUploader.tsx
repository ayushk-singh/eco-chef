"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { storage, ID } from "@/lib/appwrite";
import Tesseract from "tesseract.js";

export function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImageAsBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    return response.blob();
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    setFiles(files);
    setLoading(true);
    setError(null);

    try {
      const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID as string;
      if (!bucketId) throw new Error("Appwrite Bucket ID is missing.");

      // Step 1: Upload file to Appwrite Storage
      const response = await storage.createFile(bucketId, ID.unique(), files[0]);
      const fileId = response.$id;
      const url = storage.getFileView(bucketId, fileId).toString();
      setFileUrl(url);

      // Step 2: Fetch image as Blob & Perform OCR
      const imageBlob = await fetchImageAsBlob(url);
      const { data } = await Tesseract.recognize(imageBlob, "eng", {
        logger: (m) => console.log("Tesseract progress:", m),
      });

      setExtractedText(data.text);
      console.log("OCR Text length:", data.text.length);
      console.log("First 100 chars of OCR text:", data.text.substring(0, 100));

      const payload = { ocrText: data.text };
      
      // Debug logging before API call
      console.log("Payload size (bytes):", JSON.stringify(payload).length);
      console.log("Content-Type header:", { "Content-Type": "application/json" });

      // Step 3: Send to API with enhanced error handling
      try {
        const jsonResponse = await fetch("/api/ocr-to-json", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Log full response details
        console.log("Response status:", jsonResponse.status);
        console.log("Response headers:", Object.fromEntries(jsonResponse.headers.entries()));
        
        if (!jsonResponse.ok) {
          // Try to get error details from response
          let errorDetail;
          try {
            const errorJson = await jsonResponse.json();
            errorDetail = errorJson.error || errorJson.message || await jsonResponse.text();
          } catch (e) {
            errorDetail = await jsonResponse.text();
          }
          
          throw new Error(`API request failed with status ${jsonResponse.status}. Details: ${errorDetail}`);
        }

        const jsonResult = await jsonResponse.json();
        console.log("Successful API response:", jsonResult);

        if (!jsonResult || !jsonResult.jsonData) {
          throw new Error("Invalid API response: jsonData is missing.");
        }

        setJsonData(jsonResult.jsonData);
      } catch (apiError: any) {
        // Specific error handling for API call
        console.error("API call failed:", apiError);
        throw apiError;
      }
    } catch (error: any) {
      console.error("Error processing file:", error);
      setError(error.message || "An unknown error occurred.");
      setExtractedText("Error processing file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-32 w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <FileUpload onChange={handleFileUpload} />

      {loading && (
        <p className="text-center text-gray-600 mt-4 animate-pulse">
          Processing OCR and Converting to JSON...
        </p>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {fileUrl && (
        <div className="mt-4">
          <p className="font-semibold text-green-500">File Uploaded Successfully!</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            View File
          </a>
        </div>
      )}

      {extractedText && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Extracted Text:</h2>
          <p className="bg-gray-900 text-white p-2 rounded-lg">{extractedText}</p>
        </div>
      )}

      {jsonData && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">JSON Output:</h2>
          <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}