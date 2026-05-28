import { searchDatabase } from "../../data/searchData.js";

// دالة مساعدة لتنسيق التاريخ بالعربي
const formatArabicDate = (dateString) => {
  if (!dateString) return "تاريخ غير متوفر";
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(dateString).toLocaleDateString("ar-EG", options);
};

export const ProductDetailsPage = (id) => {
  // 🎯 جلب بيانات المنتج من قاعدة البيانات
  const product = searchDatabase.find(
    (item) => item.id == id && item.type === "products",
  );

  if (!product) return `<h1 class="error-msg">هذا المنتج غير موجود!</h1>`;

  const d = product.details;

  // 🎯 جلب المطورين المشاركين ودمج كود الـ TeamHtml بنفس ستايل الرئيسية
  const teamMembers = searchDatabase.filter(
    (item) => item.type === "people" && d.teamIds.includes(item.id),
  );

  const teamHtml = teamMembers
    .map(
      (member) => `
    <a href="/@${member.username}" class="team-member-card" data-link title="${member.title}">
      <img class="team-photo" src="${member.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${member.title}">
      <div class="team-text">
        <h5>
          <span>${member.title}</span>
          ${member.details.isOwner ? '<svg class="verified-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.92 8.6 1.5 6.71 4.7l-3.61.81.34 3.68L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2 3.4-1.42 3.4 1.41 1.89-3.2 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>' : ""}
        </h5>
        <p>${member.details.role}</p>
      </div>
    </a>
  `,
    )
    .join("");

  // 🎯 بنية الـ ToolsHtml بنفس ستايل الرئيسية
  const toolsHtml = d.tools
    .map(
      (t) => `
      <span class="product-tool-tag">
        <img src="/src/assets/icons/tool.svg" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" class="tag-icon" alt="${t}"> ${t}
      </span>
        `,
    )
    .join("");

  // مستمعات لتهيئة الـ Tabs فور تحميل الصفحة
  setTimeout(() => {
    // جلب كل الأزرار ووسومات المحتوى
    const tabsBtn = document.querySelectorAll(".tabs-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabsBtn.forEach((btn) => {
      btn.addEventListener("click", () => {
        // 1. إزالة كلاس active من كل الأزرار
        tabsBtn.forEach((b) => b.classList.remove("active"));
        // 2. إخفاء كل محتوى
        contents.forEach((c) => (c.style.display = "none"));

        // 3. تفعيل الزر المحفور
        btn.classList.add("active");
        // 4. إظهار المحتوى الخاص به بناءً على dataset.tab
        document.getElementById(`tab-${btn.dataset.tab}`).style.display =
          "block";
      });
    });
  }, 10); // تأخير بسيط لضمان تحميل الـ DOM

  // 🎯 HTML النهائي للصفحة بناءً على صورة الرئيسية
  return /* html */ `
    <div class="details-wrapper">
      
      <section class="hero-card-container">
        <div class="hero-profile-identity-block">
          <img class="user-avatar-frame product-avatar" src="${product.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${product.title}" style="border-radius: 24px;">
          
          <div class="hero-name-details">
            <div class="hero-name-row">
              <h1>${product.title}</h1>
              ${
                (product.isOwner === true || product.details?.isOwner === true)
                  ? `
                <svg class="verified-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.92 8.6 1.5 6.71 4.7l-3.61.81.34 3.68L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2 3.4-1.42 3.4 1.41 1.89-3.2 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>`
                  : ""
              }
            </div>
            
            <div class="hero-stats-row">
              <span class="stat-badge ">${d.tools.length} أداة</span>
              <span class="stat-badge projects-badge">${teamMembers.length} عضو</span>
              <span class="stat-followers-text">${formatArabicDate(d.dateFinished)}</span>
            </div>

            <div class="social-left-aside product-links">
              ${
                d.githubLink &&
                d.githubLink.trim() !== "" &&
                d.githubLink !== "#"
                  ? `<a href="${d.githubLink}" target="_blank" title="GitHub">
                       <img width="24" height="24" src="/src/assets/icons/github.svg" alt="GitHub">
                     </a>`
                  : ""
              }
              ${
                d.linkedinLink &&
                d.linkedinLink.trim() !== "" &&
                d.linkedinLink !== "#"
                  ? `<a href="${d.linkedinLink}" target="_blank" title="LinkedIn">
                      <img width="24" height="24" src="/src/assets/icons/linkedin.svg" alt="LinkedIn">
                     </a>`
                  : ""
              }
              ${
                d.facebookLink &&
                d.facebookLink.trim() !== "" &&
                d.facebookLink !== "#"
                  ? `<a href="${d.facebookLink}" target="_blank" title="Facebook">
                      <img width="24" height="24" src="/src/assets/icons/facebook.svg" alt="Instagram"> 
                     </a>`
                  : ""
              }
              ${
                d.instagramLink &&
                d.instagramLink.trim() !== "" &&
                d.instagramLink !== "#"
                  ? `<a href="${d.instagramLink}" target="_blank" title="Instagram">
                      <img width="24" height="24" src="/src/assets/icons/instagram.svg" alt="Instagram">
                     </a>`
                  : ""
              }
              ${
                d.tiktokLink &&
                d.tiktokLink.trim() !== "" &&
                d.tiktokLink !== "#"
                  ? `<a href="${d.tiktokLink}" target="_blank" title="TikTok">
                       <img width="24" height="24" src="/src/assets/icons/tiktok.svg" alt="TikTok">
                     </a>`
                  : ""
              }
            </div>

            <p class="hero-bio-text product-bio">${product.desc}</p>
          </div>
        </div>

        <div class="hero-bottom-content" style="display: flex; justify-content: flex-start; width: 100%;">
          ${
            d.liveUrl && d.liveUrl.trim() !== "" && d.liveUrl !== "#"
              ? `<a href="${d.liveUrl}" target="_blank" class="product-live-btn">
                   <span>الذهاب للموقع</span>
                 </a>`
              : `<a href="javascript:void(0)" class="product-live-btn disabled-link" title="رابط الموقع غير متوفر حالياً">
                   <span> غير متوفر</span>
                 </a>`
          }
        </div>
      </section>

      <section class="section-container">
        
        <div class="posts-filter-navbar boutique-grid-filter" style="display: grid; grid-template-columns: 1fr auto; align-items: center; width: 100%; border-bottom: 1px solid rgba(0, 0, 0, 0.05); padding-bottom: 10px; margin-bottom: 20px;">
          
          <div class="filter-tabs-group details-tabs boutique-tabs-style" style="justify-content: flex-start; gap: 8px;">
            <button class="tabs-btn active" data-tab="concept">
              الفكرة
            </button>
            <button class="tabs-btn" data-tab="team">
              الفريق <span class="tab-count">${teamMembers.length}</span>
            </button>
            <button class="tabs-btn" data-tab="tools">
             الأدوات <span class="tab-count">${d.tools.length}</span>
            </button>
          </div>

          <div class="sort-action-block" style="text-align: left;">
              <button id="sort-posts-btn" class="sort-dropdown-trigger disabled " data-order="latest0">
            <span>الأحدث</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </button>
          </div>

        </div>

        <div class="tab-content-wrapper" style="min-height: 200px; padding: 10px 0;">
          <div id="tab-concept" class="tab-content" style="display: block;">
            <p class="product-concept-text">${d.concept}</p>
          </div>
          <div id="tab-team" class="tab-content" style="display: none;">
            <div class="team-grid-layout">
              ${teamHtml}
            </div>
          </div>
          <div id="tab-tools" class="tab-content" style="display: none;">
            <div class="tools-flex-layout">
              ${toolsHtml}
            </div>
          </div>
        </div>
      </section>

    </div>
  `;
};
