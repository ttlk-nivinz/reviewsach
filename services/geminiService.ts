import { GoogleGenAI, Type, GenerateContentResponse, Part } from "@google/genai";
import { WorkInfo, MultiPlatformContent, GenerationTasks } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const reviewSchema = {
  type: Type.OBJECT,
  properties: {
    metaTitle: { type: Type.STRING, description: 'Meta Title tối ưu SEO (tối đa 60 ký tự), chứa từ khóa chính.' },
    metaDescription: { type: Type.STRING, description: 'Meta Description hấp dẫn (120-155 ký tự), chứa từ khóa chính.' },
    altText: { type: Type.STRING, description: 'Văn bản Alt cho ảnh bìa/minh họa, theo mẫu "Bìa [Tên tác phẩm]".' },
    quotes: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3 trích dẫn hay và đắt giá nhất trong tác phẩm.' },
    reviewContent: { type: Type.STRING, description: 'Nội dung bài review hoàn chỉnh (khoảng 900-1200 từ) định dạng HTML. Bài viết phải có cấu trúc sémantic với thẻ h1, h2, h3, ul, li, p, strong, em, blockquote. Phải có các phần: Mở bài, Giới thiệu/Tóm tắt nội dung, Điểm nổi bật (có thể phân tích cả Cốt truyện, Nhân vật, và Nét vẽ nếu là truyện tranh), Đánh giá chi tiết, Đối tượng phù hợp, và Kết luận.'},
  },
  required: ['metaTitle', 'metaDescription', 'altText', 'quotes', 'reviewContent']
};

const shortVideoScriptSchema = {
    type: Type.OBJECT,
    properties: {
        hook: { type: Type.STRING, description: "Câu hook dài 1 câu, cực kỳ gây tò mò trong 3 giây đầu tiên." },
        scenes: { 
            type: Type.ARRAY, 
            items: {
                type: Type.OBJECT,
                properties: {
                    scene: { type: Type.NUMBER, description: "Số thứ tự cảnh" },
                    visual: { type: Type.STRING, description: "Mô tả ngắn gọn hình ảnh hoặc video cho cảnh này." },
                    script: { type: Type.STRING, description: "Lời thoại hoặc văn bản hiển thị trên màn hình cho cảnh này." }
                },
                required: ['scene', 'visual', 'script']
            },
            description: "Kịch bản chi tiết gồm 3-5 cảnh."
        },
        cta: { type: Type.STRING, description: "Lời kêu gọi hành động ngắn gọn, mạnh mẽ ở cuối video." }
    },
    required: ['hook', 'scenes', 'cta']
};

const longVideoScriptSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Tiêu đề video Youtube hấp dẫn, chuẩn SEO." },
        intro: { type: Type.STRING, description: "Đoạn mở đầu video (khoảng 150 từ), giới thiệu tác phẩm và khơi gợi sự tò mò." },
        body: { type: Type.STRING, description: "Nội dung chính của video (dạng văn kể chuyện, khoảng 800-1000 từ), tóm tắt và phân tích các ý chính của tác phẩm một cách sâu sắc." },
        outro: { type: Type.STRING, description: "Đoạn kết thúc video (khoảng 150 từ), tóm lại giá trị tác phẩm và kêu gọi người xem like, share, subscribe." }
    },
    required: ['title', 'intro', 'body', 'outro']
};


export const generateContent = async (workInfo: WorkInfo, tasks: GenerationTasks): Promise<MultiPlatformContent> => {
    const { title, author, genre, mainKeyword, ebookLink, affiliateLink, fileContent, coverImage, outputLanguage } = workInfo;

    let prompt = `Là một chuyên gia sáng tạo nội dung đa nền tảng, chuyên gia SEO và reviewer chuyên nghiệp về sách, truyện tranh (comics, manga), và tiểu thuyết đồ họa, hãy tạo ra các sản phẩm nội dung dựa trên thông tin tác phẩm được cung cấp.
    **Ngôn ngữ đầu ra:** Viết toàn bộ nội dung bằng tiếng ${outputLanguage}.
    
    **Thông tin tác phẩm:**
    - Tên tác phẩm: ${title}
    - Tác giả/Họa sĩ: ${author}
    - Thể loại: ${genre}
    - Từ khóa chính: ${mainKeyword}
    
    **Nội dung/Tóm tắt tác phẩm:**
    ${fileContent}

    **YÊU CẦU NỘI DUNG CẦN TẠO:**
    `;

    const masterSchema: { type: Type, properties: any, required: string[] } = {
        type: Type.OBJECT,
        properties: {},
        required: []
    };

    if (tasks.review) {
        prompt += `
    **1. BÀI REVIEW (CHO BLOG/WEBSITE):**
        - **Yêu cầu:** Viết một bài review cực kỳ hấp dẫn, chuẩn SEO, dài 900-1200 từ, định dạng HTML. Nếu đây là truyện tranh, hãy chú ý nhận xét cả về phần hình ảnh, nét vẽ, và bố cục khung truyện.
        - **Cấu trúc:**
            - **Tiêu đề chính (<h1>):** Thật lôi cuốn và nổi bật. Ví dụ: "Review '${title}': Một Tác Phẩm Không Thể Bỏ Lỡ".
            - **Placeholder ảnh bìa:** Ngay sau đoạn giới thiệu đầu tiên, chèn chính xác chuỗi: \`[COVER_IMAGE_PLACEHOLDER]\`.
            - **Tiêu đề mục (<h2>):** Sử dụng các thẻ <h2> với class="text-2xl font-bold mt-8 mb-4 border-b-2 border-indigo-200 pb-2" và có emoji, bao gồm các mục: 📖 Giới thiệu, ✨ Những điểm sáng giá nhất, 🎯 Tác phẩm này dành cho ai?, ⭐ Đánh giá chi tiết, 💬 Lời kết.
        - **Alt Text:** Tạo alt text cho ảnh bìa theo mẫu "Bìa ${title}".
        - **Trích dẫn:** Trích xuất 2-3 câu hay nhất vào thẻ <blockquote>.
    `;
        masterSchema.properties.review = reviewSchema;
        masterSchema.required.push('review');
    }

    if (tasks.shortVideo) {
        prompt += `
    **2. KỊCH BẢN VIDEO NGẮN (TIKTOK/SHORTS - Dưới 60 giây):**
        - **Yêu cầu:** Viết một kịch bản video ngắn, nhanh, hấp dẫn.
        - **Cấu trúc:**
            - **Hook (3s đầu):** Một câu mở đầu cực sốc hoặc gây tò mò.
            - **Scenes (3-5 cảnh):** Mỗi cảnh mô tả ngắn gọn (1) Gợi ý hình ảnh/video, (2) Lời thoại hoặc text trên màn hình. Tập trung vào 1-2 ý đắt giá nhất của tác phẩm.
            - **CTA:** Lời kêu gọi hành động mạnh mẽ (VD: "Tìm đọc ngay để thay đổi tư duy!" hoặc "Comment ý tưởng bạn thích nhất!").
    `;
        masterSchema.properties.shortVideoScript = shortVideoScriptSchema;
        masterSchema.required.push('shortVideoScript');
    }

    if (tasks.longVideo) {
        prompt += `
    **3. KỊCH BẢN VIDEO DÀI (YOUTUBE - 10-15 phút):**
        - **Yêu cầu:** Viết một kịch bản chi tiết với giọng văn kể chuyện, truyền cảm hứng.
        - **Cấu trúc:**
            - **Title:** Tiêu đề video hấp dẫn, chuẩn SEO.
            - **Intro:** Đoạn mở đầu giới thiệu tác phẩm, nêu vấn đề và hứa hẹn giải pháp mà tác phẩm mang lại.
            - **Body:** Tóm tắt và phân tích sâu các chương hoặc các ý tưởng chính của tác phẩm một cách logic, dễ hiểu.
            - **Outro:** Tổng kết lại giá trị cốt lõi, đưa ra lời khuyên và kêu gọi khán giả like, share, subscribe và đọc/xem tác phẩm.
    `;
        masterSchema.properties.longVideoScript = longVideoScriptSchema;
        masterSchema.required.push('longVideoScript');
    }
    
    prompt += `\n**Output:** Trả về kết quả dưới dạng một đối tượng JSON duy nhất theo schema đã định nghĩa.`;


    const parts: Part[] = [{ text: prompt }];
    if (coverImage) {
        parts.push({
            inlineData: {
                mimeType: coverImage.mimeType,
                data: coverImage.data,
            },
        });
    }

    const requestConfig = {
      responseMimeType: "application/json",
      responseSchema: masterSchema,
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: parts },
            config: requestConfig,
        });

        const jsonStr = response.text.trim();
        const parsedJson = JSON.parse(jsonStr);
        
        parsedJson.downloadLink = ebookLink;
        parsedJson.purchaseLink = affiliateLink;

        return parsedJson as MultiPlatformContent;

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Lỗi từ Gemini API: ${error.message}`);
        }
        throw new Error("Một lỗi không xác định đã xảy ra khi tạo nội dung.");
    }
};