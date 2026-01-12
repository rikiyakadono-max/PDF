
import React from 'react';
import { AppFile } from '../types';
import { PdfIcon, GripVerticalIcon, XIcon } from './icons';

interface FileListItemProps {
  appFile: AppFile;
  onRemove: (id: string) => void;
  index: number;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnter: (e: React.DragEvent<HTMLLIElement>, index: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  isDragging: boolean;
}

const FileListItem: React.FC<FileListItemProps> = ({
  appFile,
  onRemove,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging
}) => {
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`flex items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-all duration-300 ${isDragging ? 'opacity-50 scale-105 shadow-lg' : 'opacity-100'}`}
    >
      <div className="flex items-center flex-grow">
        <div className="cursor-grab p-1" title="ドラッグして順序を入れ替え">
            <GripVerticalIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>
        <PdfIcon className="w-6 h-6 text-red-500 mx-3 flex-shrink-0" />
        <span className="text-sm text-slate-700 dark:text-slate-200 truncate" title={appFile.file.name}>
          {appFile.file.name}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onRemove(appFile.id)}
        className="ml-4 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
        aria-label="ファイルを削除"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

export default FileListItem;
