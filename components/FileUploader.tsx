
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileFilter = (files: FileList | null): File[] => {
    if (!files) return [];
    return Array.from(files).filter(file => file.type === 'application/pdf');
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const newFiles = handleFileFilter(e.dataTransfer.files);
    if (newFiles.length > 0) {
      onFilesSelected(newFiles);
    }
  }, [onFilesSelected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = handleFileFilter(e.target.files);
    if (newFiles.length > 0) {
      onFilesSelected(newFiles);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors duration-200 ease-in-out ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
      />
      <UploadIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
      <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
        ここにPDFをドラッグ＆ドロップ
      </p>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">または</p>
      <button
        type="button"
        onClick={onButtonClick}
        className="px-6 py-2 text-white bg-primary-600 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 transition-all"
      >
        ファイルを選択
      </button>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">※PDFファイルのみ対応しています</p>
    </div>
  );
};

export default FileUploader;
