import React, { useState } from 'react';
import { WorkInfo, MultiPlatformContent, GenerationTasks } from './types';
import { generateContent } from './services/geminiService';
import BookInfoForm from './components/BookInfoForm';
import ReviewDisplay from './components/ReviewDisplay';
import BookIcon from './components/icons/BookIcon';

const App: React.FC = () => {
  const [generatedContent, setGeneratedContent] = useState<MultiPlatformContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [submittedCoverImage, setSubmittedCoverImage] = useState<{ data: string; mimeType: string; } | null>(null);
  const [generationTasks, setGenerationTasks] = useState<GenerationTasks>({
    review: true,
    shortVideo: false,
    longVideo: false,
  });

  const handleGenerate = async (workInfo: WorkInfo) => {
    setIsLoading(true);
    setError('');
    setGeneratedContent(null);
    setSubmittedCoverImage(null);

    try {
      setSubmittedCoverImage(workInfo.coverImage);
      const result = await generateContent(workInfo, generationTasks);
      setGeneratedContent(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Đã có lỗi không xác định xảy ra.';
      setError(`Không thể tạo nội dung: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="flex justify-center items-center mb-4">
              <BookIcon className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              AI Review Generator
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Tạo bài review, kịch bản video chuyên nghiệp cho sách, truyện tranh, manga... từ tệp .txt của bạn.
            </p>
          </header>
          
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
            <BookInfoForm 
              onGenerate={handleGenerate} 
              isLoading={isLoading}
              tasks={generationTasks}
              onTasksChange={setGenerationTasks}
            />
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
              <p><strong>Lỗi:</strong> {error}</p>
            </div>
          )}

          <ReviewDisplay 
            content={generatedContent} 
            isLoading={isLoading}
            coverImage={submittedCoverImage}
          />
          
          <footer className="text-center mt-12 text-gray-500">
            <p>Phát triển bởi Google Gemini API</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;