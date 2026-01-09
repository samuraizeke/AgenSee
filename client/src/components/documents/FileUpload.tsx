'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getClientApiUrl } from '@/lib/client-api-url';

interface FileUploadProps {
  clientId?: string;
  policyId?: string;
  onUploadComplete?: (document: UploadedDocument) => void;
  onError?: (error: string) => void;
  accessToken: string;
}

interface UploadedDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUpload({
  clientId,
  policyId,
  onUploadComplete,
  onError,
  accessToken,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not allowed. Allowed types: PDF, Images, Word, Excel, Text, CSV.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 50MB limit.`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      let filePath = '';

      if (clientId) {
        filePath = `clients/${clientId}/${timestamp}-${sanitizedFileName}`;
      } else if (policyId) {
        filePath = `policies/${policyId}/${timestamp}-${sanitizedFileName}`;
      } else {
        filePath = `general/${timestamp}-${sanitizedFileName}`;
      }

      // Upload directly to Supabase Storage
      setUploadProgress(10);

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress(70);

      // Create document record in database via API
      const response = await fetch(
        `${getClientApiUrl()}/documents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            client_id: clientId || null,
            policy_id: policyId || null,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
          }),
        }
      );

      setUploadProgress(90);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save document record');
      }

      const result = await response.json();
      setUploadProgress(100);

      onUploadComplete?.(result.data);
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : isUploading
          ? 'border-gray-300 bg-gray-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept={ALLOWED_TYPES.join(',')}
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-gray-700">
            Uploading... {uploadProgress}%
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-4 text-sm text-gray-600">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Click to upload
            </button>{' '}
            or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PDF, Images, Word, Excel, CSV up to 50MB
          </p>
        </div>
      )}
    </div>
  );
}
