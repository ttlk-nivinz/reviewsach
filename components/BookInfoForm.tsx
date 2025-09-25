import React, { useState } from 'react';
import { WorkInfo, GenerationTasks } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import { LANGUAGES } from '../constants/languages';

interface BookInfoFormProps {
  onGenerate: (workInfo: WorkInfo) => void;
  isLoading: boolean;
  tasks: GenerationTasks;
  onTasksChange: (tasks: GenerationTasks) => void;
}

const BookInfoForm: React.FC<BookInfoFormProps> = ({ onGenerate, isLoading, tasks, onTasksChange }) => {
  const [workInfo, setWorkInfo] = useState<Omit<WorkInfo, 'fileContent' | 'coverImage'>>({
    title: '', author: '', genre: '', mainKeyword: '', ebookLink: '', affiliateLink: '', outputLanguage: 'Vietnamese'
  });
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [coverImage, setCoverImage] = useState<{ data: string; mimeType: string; } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onTasksChange({ ...tasks, [name]: checked });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .txt');
      e.target.value = '';
      return;
    }

    setIsProcessingFile(true);
    setFileName(file.name);
    try {
      const text = await file.text();
      setFileContent(text);
    } catch (error) {
      console.error("Lỗi đọc file:", error);
      alert('Không thể đọc nội dung file.');
      setFileName('');
    } finally {
      setIsProcessingFile(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultString = reader.result as string;
        const base64Data = resultString.split(',')[1];
        if (base64Data) {
          setCoverImage({ data: base64Data, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent) {
      alert('Vui lòng tải lên tệp nội dung tóm tắt (.txt).');
      return;
    }
    if (!tasks.review && !tasks.shortVideo && !tasks.longVideo) {
        alert('Vui lòng chọn ít nhất một loại nội dung để tạo.');
        return;
    }
    onGenerate({ ...workInfo, fileContent, coverImage });
  };

  const isAnyTaskSelected = tasks.review || tasks.shortVideo || tasks.longVideo;
  const isFormSubmittable = !isProcessingFile && !!fileContent && isAnyTaskSelected;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="space-y-1">
        <label htmlFor="outputLanguage" className="text-sm font-medium text-gray-700">Ngôn ngữ đầu ra <span className="text-red-500">*</span></label>
        <select
          id="outputLanguage"
          name="outputLanguage"
          onChange={handleInputChange}
          value={workInfo.outputLanguage}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {LANGUAGES.map(({ code, name }) => (
            <option key={code} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          ['title', 'Tên sách / Truyện', 'VD: One Piece'], 
          ['author', 'Tác giả / Họa sĩ', 'VD: Eiichiro Oda'], 
          ['genre', 'Thể loại', 'VD: Manga, Phiêu lưu'], 
          ['mainKeyword', 'Từ khóa chính SEO', 'VD: review manga one piece']
        ].map(([name, label, placeholder]) => (
          <div className="space-y-1" key={name}>
            <label htmlFor={name} className="text-sm font-medium text-gray-700">{label} <span className="text-red-500">*</span></label>
            <input id={name} name={name} type="text" onChange={handleInputChange} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
        ))}
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Nội dung tóm tắt (.txt) <span className="text-red-500">*</span></label>
            <label htmlFor="file-upload" className="cursor-pointer mt-1 flex justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md h-full items-center">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex text-sm text-gray-600"><p className="pl-1">{fileName ? 'Thay đổi tệp' : 'Chọn tệp để tải lên'}</p></div>
                    <p className="text-xs text-gray-500">Chỉ hỗ trợ tệp .TXT</p>
                </div>
            </label>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".txt" onChange={handleFileChange} />
            {isProcessingFile && <p className="text-sm text-gray-500 mt-1">Đang xử lý tệp...</p>}
            {fileName && !isProcessingFile && <p className="text-sm text-green-600 mt-1">Đã tải lên: {fileName}</p>}
        </div>
         <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">Ảnh bìa / Minh họa (tùy chọn)</label>
            <label htmlFor="image-upload" className="cursor-pointer mt-1 flex justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md h-full items-center">
                {coverImage ? <img src={`data:${coverImage.mimeType};base64,${coverImage.data}`} alt="Xem trước bìa" className="h-24 object-contain" /> : <div className="space-y-1 text-center"><svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><div className="flex text-sm text-gray-600"><p className="pl-1">Chọn ảnh</p></div><p className="text-xs text-gray-500">PNG, JPG, WEBP</p></div>}
            </label>
             <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
        </div>
      </div>
      <div>
        <label htmlFor="ebookLink" className="text-sm font-medium text-gray-700">Link đọc / tải tác phẩm <span className="text-red-500">*</span></label>
        <input id="ebookLink" name="ebookLink" type="url" onChange={handleInputChange} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
      </div>
      <div>
        <label htmlFor="affiliateLink" className="text-sm font-medium text-gray-700">Link mua tác phẩm (Affiliate, tùy chọn)</label>
        <input id="affiliateLink" name="affiliateLink" type="url" onChange={handleInputChange} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <label className="text-base font-semibold text-gray-900">Chọn Nội Dung Cần Tạo</label>
        <p className="text-sm text-gray-500">Bạn có thể chọn một hoặc nhiều loại nội dung.</p>
        <fieldset className="mt-4">
          <legend className="sr-only">Lựa chọn loại nội dung</legend>
          <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
            <div className="flex items-center">
              <input id="review" name="review" type="checkbox" checked={tasks.review} onChange={handleTaskChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="review" className="ml-3 block text-sm font-medium text-gray-700">Bài Review (Blog/Web)</label>
            </div>
            <div className="flex items-center">
              <input id="shortVideo" name="shortVideo" type="checkbox" checked={tasks.shortVideo} onChange={handleTaskChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="shortVideo" className="ml-3 block text-sm font-medium text-gray-700">Kịch bản Video Ngắn (TikTok/Shorts)</label>
            </div>
            <div className="flex items-center">
              <input id="longVideo" name="longVideo" type="checkbox" checked={tasks.longVideo} onChange={handleTaskChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="longVideo" className="ml-3 block text-sm font-medium text-gray-700">Kịch bản Video Dài (Youtube)</label>
            </div>
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-4">
        <button type="submit" disabled={!isFormSubmittable || isLoading} className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors">
          {isLoading ? <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Đang tạo...</> : <><SparklesIcon className="w-5 h-5 mr-2" />Tạo Nội Dung</>}
        </button>
      </div>
    </form>
  );
};

export default BookInfoForm;