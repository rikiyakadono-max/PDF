
import React, { useState, useCallback, useRef } from 'react';
import { AppFile } from './types';
import FileUploader from './components/FileUploader';
import FileListItem from './components/FileListItem';
import PdfPreview from './components/PdfPreview';

// pdf-lib is loaded from a CDN in index.html, we need to declare it for TypeScript
declare const PDFLib: any;

const App: React.FC = () => {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergedFileName, setMergedFileName] = useState<string>('');
  const [finalFileName, setFinalFileName] = useState<string>('');

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);


  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const newAppFiles: AppFile[] = newFiles.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file
    }));
    setFiles(prevFiles => [...prevFiles, ...newAppFiles]);
    setMergedPdfUrl(null);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragItem.current = index;
    setDragging(true);
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
      dragOverItem.current = index;
      const newFiles = [...files];
      const dragItemContent = newFiles.splice(dragItem.current!, 1)[0];
      newFiles.splice(dragOverItem.current!, 0, dragItemContent);
      dragItem.current = dragOverItem.current;
      dragOverItem.current = null;
      setFiles(newFiles);
  };

  const handleDragEnd = () => {
      dragItem.current = null;
      dragOverItem.current = null;
      setDragging(false);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("結合するには少なくとも2つのPDFファイルを選択してください。");
      return;
    }
    setIsMerging(true);
    setError(null);

    try {
      const { PDFDocument } = PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (const appFile of files) {
        const arrayBuffer = await appFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const getFormattedDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
      };

      const finalName = (mergedFileName.trim() || getFormattedDate()) + '.pdf';

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setFinalFileName(finalName);
      setMergedPdfUrl(url);

    } catch (err) {
      console.error("Error merging PDFs:", err);
      setError("PDFの結合中にエラーが発生しました。すべてのファイルが有効なPDFであることを確認してください。");
    } finally {
      setIsMerging(false);
    }
  };

  const handleReset = () => {
    if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
    }
    setFiles([]);
    setMergedPdfUrl(null);
    setError(null);
    setIsMerging(false);
    setMergedFileName('');
    setFinalFileName('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
      <main className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
            PDF <span className="text-primary-600">結合ツール</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            複数のPDFファイルを、一つのドキュメントに素早く簡単にまとめます。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Panel: File Upload and List */}
          <div className="flex flex-col gap-6">
            <FileUploader onFilesSelected={handleFilesSelected} />
            
            {files.length > 0 && (
              <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">結合するファイル</h2>
                {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4 text-sm">{error}</p>}
                
                {files.length > 0 ? (
                  <ul className="space-y-3">
                    {files.map((file, index) => (
                      <FileListItem
                        key={file.id}
                        appFile={file}
                        onRemove={handleRemoveFile}
                        index={index}
                        onDragStart={handleDragStart}
                        onDragEnter={handleDragEnter}
                        onDragEnd={handleDragEnd}
                        isDragging={dragging && dragItem.current === index}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">ファイルが選択されていません。</p>
                )}
                
                <div className="mt-6">
                    <label htmlFor="filename" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        保存するファイル名 (任意)
                    </label>
                    <input
                        type="text"
                        id="filename"
                        value={mergedFileName}
                        onChange={(e) => setMergedFileName(e.target.value)}
                        placeholder="例: 会議資料 (デフォルト: YYYYMMDD)"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                        disabled={isMerging}
                    />
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleReset}
                        className="w-full sm:w-auto flex-shrink-0 px-6 py-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50"
                        disabled={isMerging}
                    >
                        リセット
                    </button>
                    <button
                      onClick={handleMerge}
                      disabled={isMerging || files.length < 2}
                      className="w-full flex-grow px-6 py-3 text-white bg-primary-600 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMerging ? '結合中...' : `${files.length} 個のファイルを結合`}
                    </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: PDF Preview */}
          <div className="bg-slate-200 dark:bg-slate-800/50 rounded-xl flex items-center justify-center min-h-[60vh] lg:min-h-full p-2 aspect-[4/5.65]">
            {mergedPdfUrl ? (
              <PdfPreview pdfUrl={mergedPdfUrl} onReset={handleReset} fileName={finalFileName}/>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <p className="font-medium">ここに結合後のプレビューが表示されます。</p>
                <p className="text-sm">まずはファイルをアップロードしてください。</p>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center mt-12 py-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                React, TypeScript, Tailwind CSS を使用して構築されています。すべての処理はブラウザ内で安全に行われます。
            </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
