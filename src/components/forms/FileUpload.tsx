import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  multiple?: boolean;
  value?: File[];
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
  },
  multiple = true,
  value = [],
  error
}) => {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = multiple 
      ? [...value, ...acceptedFiles].slice(0, maxFiles)
      : acceptedFiles.slice(0, 1);
    
    onFilesChange(newFiles);

    // Create previews for images
    acceptedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviews(prev => [...prev, { file, url }]);
      }
    });
  }, [value, onFilesChange, maxFiles, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled: value.length >= maxFiles
  });

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    
    // Clean up preview URL
    const removedFile = value[index];
    setPreviews(prev => {
      const preview = prev.find(p => p.file === removedFile);
      if (preview) {
        URL.revokeObjectURL(preview.url);
        return prev.filter(p => p.file !== removedFile);
      }
      return prev;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (file: File) => file.type.startsWith('image/');

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${value.length >= maxFiles ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-2">
          <div className="flex justify-center">
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? 'Drop files here' : 'Click to upload or drag files here'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>

          {/* Camera button for mobile */}
          <div className="mt-3">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                // Create a file input with camera capture
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'environment';
                input.multiple = multiple;
                input.onchange = (e) => {
                  const files = Array.from((e.target as HTMLInputElement).files || []);
                  if (files.length > 0) {
                    onDrop(files);
                  }
                };
                input.click();
              }}
            >
              <Camera className="h-3 w-3 mr-1" />
              Take Photo
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* File list */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Attached files ({value.length}/{maxFiles})
          </h4>
          
          <div className="grid gap-2 sm:grid-cols-2">
            {value.map((file, index) => {
              const preview = previews.find(p => p.file === file);
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md border"
                >
                  {/* Preview thumbnail */}
                  {preview ? (
                    <img
                      src={preview.url}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                      <Upload className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};