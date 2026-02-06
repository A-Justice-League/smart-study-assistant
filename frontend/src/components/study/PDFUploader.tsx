import { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
  file: File | null;
}

export default function PDFUploader({ onUpload, disabled, file }: PDFUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile?.type === 'application/pdf') {
        onUpload(droppedFile);
      }
    },
    [disabled, onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile?.type === 'application/pdf') {
        onUpload(selectedFile);
      }
    },
    [onUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
        ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
      `}
    >
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div className="text-left">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      ) : (
        <>
          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="mt-4 font-medium">Drop your PDF here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
        </>
      )}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ position: 'absolute', inset: 0 }}
      />
      <div className="relative">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload">
          <Button
            variant="outline"
            className="mt-4"
            disabled={disabled}
            asChild
          >
            <span>Select PDF</span>
          </Button>
        </label>
      </div>
    </div>
  );
}
