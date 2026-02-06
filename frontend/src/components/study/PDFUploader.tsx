import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
  file: File | null;
}

export default function PDFUploader({ onUpload, disabled, file }: PDFUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile?.type === 'application/pdf') {
        onUpload(droppedFile);
      }
    },
    [disabled, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

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
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      transition={{ duration: 0.2 }}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isDragOver 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : file 
          ? 'border-success bg-success/5' 
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="relative">
              <FileText className="w-12 h-12 text-success" />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            </div>
            <div className="text-left">
              <p className="font-semibold text-success">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
              </p>
            </div>
          </motion.div>
        ) : isDragOver ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="w-10 h-10 text-primary animate-bounce" />
            </div>
            <div>
              <p className="font-semibold text-primary">Drop your PDF here</p>
              <p className="text-sm text-muted-foreground">Release to upload</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-4 rounded-full bg-muted">
              <Upload className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Drop your PDF here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              disabled={disabled}
            >
              <Upload className="w-4 h-4" />
              Select PDF
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      {!file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <AlertCircle className="w-3 h-3" />
          <span>Maximum file size: 10MB • PDF format only</span>
        </motion.div>
      )}
    </motion.div>
  );
}
