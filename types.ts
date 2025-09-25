// types.ts
export interface WorkInfo {
  title: string;
  author: string;
  genre: string;
  mainKeyword: string;
  ebookLink: string;
  affiliateLink?: string;
  fileContent: string;
  coverImage: { data: string; mimeType: string; } | null;
  outputLanguage: string;
}

export interface ReviewContent {
  metaTitle?: string;
  metaDescription?: string;
  altText?: string;
  quotes?: string[];
  reviewContent: string;
}

export interface ShortVideoScript {
  hook: string; // Câu mở đầu 3 giây
  scenes: {
    scene: number;
    visual: string; // Gợi ý hình ảnh/video
    script: string; // Lời thoại/text trên màn hình
  }[];
  cta: string; // Kêu gọi hành động
}

export interface LongVideoScript {
    title: string; // Tiêu đề video Youtube
    intro: string; // Đoạn mở đầu
    body: string; // Nội dung chính, dạng kể chuyện
    outro: string; // Đoạn kết và kêu gọi hành động
}


export interface MultiPlatformContent {
  review?: ReviewContent;
  shortVideoScript?: ShortVideoScript;
  longVideoScript?: LongVideoScript;
  downloadLink?: string;
  purchaseLink?: string;
}

export interface GenerationTasks {
  review: boolean;
  shortVideo: boolean;
  longVideo: boolean;
}