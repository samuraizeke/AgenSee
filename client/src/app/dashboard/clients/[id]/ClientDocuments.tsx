'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/documents/FileUpload';
import { DocumentList } from '@/components/documents/DocumentList';

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

interface ClientDocumentsProps {
  clientId: string;
  initialDocuments: Document[];
  accessToken: string;
}

export function ClientDocuments({
  clientId,
  initialDocuments,
  accessToken,
}: ClientDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUploadComplete = (newDoc: Document) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSuccessMessage('Document uploaded successfully!');
    setError(null);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccessMessage(null);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage documents for this client
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* Upload Area */}
        <FileUpload
          clientId={clientId}
          accessToken={accessToken}
          onUploadComplete={handleUploadComplete}
          onError={handleUploadError}
        />

        {/* Messages */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Document List */}
        <DocumentList
          documents={documents}
          accessToken={accessToken}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
