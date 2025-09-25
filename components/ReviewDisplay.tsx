import React, { useState, useEffect, useMemo } from 'react';
import { MultiPlatformContent, ReviewContent, ShortVideoScript, LongVideoScript } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import BookIcon from './icons/BookIcon';
import HtmlIcon from './icons/HtmlIcon';
import VideoIcon from './icons/VideoIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface ReviewDisplayProps {
  content: MultiPlatformContent | null;
  isLoading: boolean;
  coverImage: { data: string; mimeType: string; } | null;
}

const SeoMetadataDisplay = ({ review }: { review: ReviewContent }) => (
    <div className="mt-8 p-6 border rounded-xl bg-indigo-50/50">
        <h3 className="text-xl font-bold text-gray-900 mb-4">SEO & Metadata</h3>
        <div className="space-y-4">
            <div><strong className="font-semibold text-gray-800">Meta Title:</strong><p className="p-2 bg-white rounded-md text-gray-700 mt-1 shadow-sm border">{review.metaTitle}</p></div>
            <div><strong className="font-semibold text-gray-800">Meta Description:</strong><p className="p-2 bg-white rounded-md text-gray-700 mt-1 shadow-sm border">{review.metaDescription}</p></div>
            <div><strong className="font-semibold text-gray-800">Alt Text:</strong><p className="p-2 bg-white rounded-md text-gray-700 mt-1 shadow-sm border">{review.altText}</p></div>
            {review.quotes && review.quotes.length > 0 && (
                <div>
                    <strong className="font-semibold text-gray-800">Trích dẫn:</strong>
                    <div className="space-y-2 mt-1">
                        {review.quotes.map((q, i) => <blockquote key={i} className="border-l-4 border-indigo-500 pl-3 py-1 bg-white shadow-sm"><p className="italic">"{q}"</p></blockquote>)}
                    </div>
                </div>
            )}
        </div>
    </div>
);

const ReviewContentDisplay = ({ review, coverImage }: { review: ReviewContent, coverImage: ReviewDisplayProps['coverImage'] }) => {
  const [copiedType, setCopiedType] = useState<'text' | 'html' | null>(null);

  useEffect(() => {
    if (copiedType) {
      const timer = setTimeout(() => setCopiedType(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedType]);

  const processedContent = useMemo(() => {
    let reviewHtml = review.reviewContent;
    if (coverImage && reviewHtml.includes('[COVER_IMAGE_PLACEHOLDER]')) {
      const altText = review.altText || 'Bìa tác phẩm';
      const imageHtml = `
        <figure class="flex flex-col items-center my-8">
          <img src="data:${coverImage.mimeType};base64,${coverImage.data}" alt="${altText}" class="rounded-lg shadow-xl max-w-xs w-full h-auto object-contain border-4 border-white" />
          <figcaption class="mt-3 text-sm text-center text-gray-500 italic">${altText}</figcaption>
        </figure>`;
      reviewHtml = reviewHtml.replace('[COVER_IMAGE_PLACEHOLDER]', imageHtml);
    } else {
        reviewHtml = reviewHtml.replace('[COVER_IMAGE_PLACEHOLDER]', '');
    }
    return reviewHtml;
  }, [review, coverImage]);

  const handleCopy = (type: 'text' | 'html') => {
    if (type === 'html') {
        navigator.clipboard.writeText(processedContent);
    } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = processedContent;
        navigator.clipboard.writeText(tempDiv.textContent || tempDiv.innerText || '');
    }
    setCopiedType(type);
  };
  
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {copiedType && <span className="text-sm px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 font-semibold transition-all">Đã chép {copiedType === 'html' ? 'HTML' : 'văn bản'}!</span>}
        <button onClick={() => handleCopy('text')} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" title="Sao chép văn bản (cho Mạng Xã Hội)">
           <ClipboardIcon className="w-5 h-5" />
        </button>
        <button onClick={() => handleCopy('html')} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" title="Sao chép HTML (cho Web/Blog)">
            <HtmlIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="prose prose-lg max-w-none prose-indigo text-justify" dangerouslySetInnerHTML={{ __html: processedContent }} />
    </div>
  );
};

const SingleCopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
  };
  
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      {copied && <span className="text-sm px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 font-semibold transition-all">Đã chép!</span>}
      <button onClick={handleCopy} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" title="Sao chép kịch bản">
        <ClipboardIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

const ShortVideoScriptDisplay = ({ script }: { script: ShortVideoScript }) => {
    const fullScriptText = `**Hook:**\n${script.hook}\n\n**Scenes:**\n${script.scenes.map(s => `Cảnh ${s.scene}:\n- Hình ảnh: ${s.visual}\n- Lời thoại: ${s.script}`).join('\n\n')}\n\n**CTA:**\n${script.cta}`;
    return (
        <div className="relative font-mono text-gray-800">
            <SingleCopyButton textToCopy={fullScriptText} />
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-bold text-yellow-900">🎬 Kịch bản Video Ngắn</h3>
            </div>
            <div className="mt-4 space-y-4">
                <div>
                    <h4 className="font-bold text-indigo-600">🔥 HOOK (3 giây đầu)</h4>
                    <p className="p-3 bg-white rounded-md mt-1 border shadow-sm">{script.hook}</p>
                </div>
                <div>
                    <h4 className="font-bold text-indigo-600">🎞️ CÁC CẢNH</h4>
                    <div className="space-y-3 mt-1">
                        {script.scenes.map(scene => (
                            <div key={scene.scene} className="p-3 bg-white rounded-md border shadow-sm">
                                <p className="font-semibold">Cảnh {scene.scene}</p>
                                <p><strong className="text-gray-600">Hình ảnh:</strong> {scene.visual}</p>
                                <p><strong className="text-gray-600">Lời thoại:</strong> {scene.script}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-indigo-600">🚀 KÊU GỌI HÀNH ĐỘNG (CTA)</h4>
                    <p className="p-3 bg-white rounded-md mt-1 border shadow-sm">{script.cta}</p>
                </div>
            </div>
        </div>
    );
};

const LongVideoScriptDisplay = ({ script }: { script: LongVideoScript }) => {
    const fullScriptText = `**Tiêu đề:**\n${script.title}\n\n**Mở đầu:**\n${script.intro}\n\n**Nội dung chính:**\n${script.body}\n\n**Kết luận:**\n${script.outro}`;
    return (
        <div className="relative prose prose-lg max-w-none">
            <SingleCopyButton textToCopy={fullScriptText} />
            <h2 className="text-2xl font-bold text-center">{script.title}</h2>
            <div className="mt-6 space-y-6">
                 <div>
                    <h3 className="font-bold text-xl text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-2">🎙️ Mở Đầu</h3>
                    <p>{script.intro}</p>
                </div>
                 <div>
                    <h3 className="font-bold text-xl text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-2">📚 Nội Dung Chính</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{script.body}</p>
                </div>
                 <div>
                    <h3 className="font-bold text-xl text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-2">⭐ Kết Luận</h3>
                    <p>{script.outro}</p>
                </div>
            </div>
        </div>
    );
};


const ReviewDisplay: React.FC<ReviewDisplayProps> = ({ content, isLoading, coverImage }) => {
  const availableTabs = useMemo(() => {
      if (!content) return [];
      const tabs = [];
      if (content.review) tabs.push('review');
      if (content.shortVideoScript) tabs.push('shortVideo');
      if (content.longVideoScript) tabs.push('longVideo');
      return tabs;
  }, [content]);
  
  const [activeTab, setActiveTab] = useState(availableTabs[0] || '');
  
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
        setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  if (isLoading) {
    return (
      <div className="mt-8 p-6 border rounded-lg bg-white shadow-md flex flex-col items-center justify-center h-64">
        <svg className="animate-spin h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="mt-4 text-gray-700 font-semibold text-lg">AI đang sáng tạo nội dung đa nền tảng...</p>
        <p className="text-gray-500">Việc này có thể mất một vài phút, xin vui lòng chờ.</p>
      </div>
    );
  }

  if (!content) {
    return (
        <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center h-64 text-center">
            <BookIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-800">Kết quả của bạn sẽ xuất hiện ở đây</h3>
            <p className="mt-1 text-gray-500">Điền thông tin và chọn loại nội dung để bắt đầu.</p>
        </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {content.review && (
              <button onClick={() => setActiveTab('review')} className={`${activeTab === 'review' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
                <BookIcon className="w-5 h-5"/> Bài Review
              </button>
            )}
            {content.shortVideoScript && (
              <button onClick={() => setActiveTab('shortVideo')} className={`${activeTab === 'shortVideo' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
                <VideoIcon className="w-5 h-5"/> Video Ngắn
              </button>
            )}
             {content.longVideoScript && (
              <button onClick={() => setActiveTab('longVideo')} className={`${activeTab === 'longVideo' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
                <MicrophoneIcon className="w-5 h-5"/> Video Dài
              </button>
            )}
          </nav>
        </div>
        
        <div className="mt-6 p-6 md:p-8 border rounded-b-xl rounded-tr-xl bg-white shadow-lg">
            {activeTab === 'review' && content.review && <ReviewContentDisplay review={content.review} coverImage={coverImage} />}
            {activeTab === 'shortVideo' && content.shortVideoScript && <ShortVideoScriptDisplay script={content.shortVideoScript} />}
            {activeTab === 'longVideo' && content.longVideoScript && <LongVideoScriptDisplay script={content.longVideoScript} />}
        </div>
      </div>
       {(content.downloadLink || content.purchaseLink) && (
            <div className="mt-10 pt-6 border-t-2 border-dashed">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Hành động ngay!</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    {content.downloadLink && <a href={content.downloadLink} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-transform">🚀 Đọc / Tải tác phẩm</a>}
                    {content.purchaseLink && <a href={content.purchaseLink} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-transform">🛒 Mua tác phẩm</a>}
                </div>
            </div>
        )}

      {activeTab === 'review' && content.review && <SeoMetadataDisplay review={content.review} />}
    </div>
  );
};

export default ReviewDisplay;