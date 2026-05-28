import { searchDatabase } from '../../data/searchData.js';

// 🎯 دالة ذكية لتحويل التاريخ إلى الصيغة العربية (مثال: 20 مايو 2026)
const formatArabicDate = (dateString) => {
  if (!dateString) return 'منذ أيام';
  const dateObj = new Date(dateString);
  
  // لو التاريخ المكتوب مش بالصيغة القياسية (YYYY-MM-DD)، هيرجع النص الأصلي زي ما هو كـ Fallback
  if (isNaN(dateObj.getTime())) return dateString; 

  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
};

export const TagDetailsPage = (id) => {
  const currentTag = searchDatabase.find(item => item.id == id && item.type === "tags");
  
  if (!currentTag) {
    return `
      <div style="max-width: 750px; margin: 140px auto; text-align: center; direction: rtl; font-family: sans-serif;">
        <img src="/src/assets/icons/noresualt.svg" style="width: 100px; opacity: 0.4; margin-bottom: 20px;" alt="غير موجود">
        <h1 style="color: #ff5722; font-size: 1.6rem; margin-bottom: 10px; font-weight: 700;">المنشور غير موجود</h1>
        <p style="color: #666; margin-bottom: 25px;">يبدو أن هذا المنشور تم حذفه أو غير موجود بقاعدة البيانات.</p>
        <a href="/" class="btn-test" data-link style="background: var(--mainColor, #00adb5); color: white; padding: 10px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">العودة للرئيسية</a>
      </div>
    `;
  }

  const d = currentTag.details || {}; 
  const author = searchDatabase.find(item => item.type === "people" && item.id == currentTag.authorId);
  
  let authorRoute = "/";
  if (author) {
    if (author.id == 0) {
      authorRoute = "/"; 
    } else {
      authorRoute = author.username ? `/@${author.username.toLowerCase()}` : `/person/${author.id}`;
    }
  }

  const categoryMap = {
    "tech": "تقني",
    "sports": "رياضي",
    "design": "تصميم",
    "business": "ريادة أعمال"
  };
  const postCategoryArabic = categoryMap[currentTag.postCategory] || "منشور عام";

  return `
    <div class="tag-isolated-wrapper">
      
      <div class="tag-title-block">
        <h1>${currentTag.title}</h1>
      </div>

      <div class="category-wrapper-block" style="display: block; width: 100%; margin-bottom: 25px;">
        <div class="post-category-tag" style="margin-bottom: 0;">
          ${postCategoryArabic}
        </div>
      </div>

      ${author ? `
        <div class="author-wrapper-block" style="display: block; width: 100%; text-align: right;">
          <a href="${authorRoute}" data-link class="post-author-link">
            <img src="${author.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${author.title}">
            <div class="author-info-text">
              <span class="name">${author.title}</span>
              <span class="date">${formatArabicDate(currentTag.date)}</span>
            </div>
          </a>
        </div>
      ` : ''}

      <hr class="post-divider">

      <article class="post-main-article">
        
        ${d.featuredText ? `
          <div class="post-featured-quote">
            "${d.featuredText}"
          </div>
        ` : ''}
        
        <p class="post-paragraph" style="font-weight: 600;">
          ${currentTag.desc}
        </p>

        ${d.longContent ? `
          <div class="post-paragraph">
            ${d.longContent}
          </div>
        ` : ''}

        ${d.bulletPoints && Array.isArray(d.bulletPoints) ? `
          <ul class="post-bullet-list">
            ${d.bulletPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        ` : ''}

      </article>

    </div>
  `;
};