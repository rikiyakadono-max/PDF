
import React from 'react';
import { DownloadIcon } from './icons';

interface PdfPreviewProps {
  pdfUrl: string;
  onReset: () => void;
  fileName: string;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ pdfUrl, onReset, fileName }) => {
  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="flex-grow">
        <iframe src={pdfUrl} className="w-full h-full border-0" title="結合されたPDFのプレビュー" />
      </div>
      <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="px-6 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
        >
          さらに結合する
        </button>
        <a
          href={pdfUrl}
          download={fileName}
          className="flex items-center gap-2 px-6 py-2 text-white bg-primary-600 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
        >
          <DownloadIcon className="w-5 h-5" />
          ダウンロード
        </a>
      </div>
    </div>
  );
};

export default PdfPreview;
