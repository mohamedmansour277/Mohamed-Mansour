import { searchDatabase } from "../../data/searchData.js";

// 🎯 دالة مساعدة لإنشاء المسار الذكي بناءً على وجود الـ username أو الـ id
const getSmartRoute = (item, fallbackType) => {
  if (item.username) {
    return `/@${item.username.toLowerCase()}`;
  }
  return `/${fallbackType}/${item.id}`;
};

export const renderPersonPosts = (personId, sortOrder = "latest") => {
  const personPosts = searchDatabase.filter(
    (item) => item.type === "tags" && item.authorId == personId,
  );
  const sortBtn = document.querySelector(".sort-person-posts-btn");

  if (personPosts.length === 0) {
    if (sortBtn) sortBtn.classList.add("disabled");
    return `
      <div class="empty-posts-state">
        <img src="/src/assets/icons/noresualt.svg" class="empty-state-icon" alt="لا تتوفر منشورات">
        <p class="empty-state-text">لا تتوفر منشورات</p>
      </div>
    `;
  }

  if (sortBtn) sortBtn.classList.remove("disabled");

  personPosts.sort((a, b) => {
    return sortOrder === "latest"
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });

  // 🎯 دالة داخلية لتحويل صيغة التاريخ من قاعدة البيانات إلى اللغة العربية فوراً
  const formatDateToArabic = (dateString) => {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return dateString; // حماية في حال كان التاريخ المكتوب غير صالح
    
    return new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
  };

  return personPosts
    .map(
      (post) => `
    <a href="${getSmartRoute(post, "tag")}" class="post-item-card" data-link style="animation: fadeIn 0.3s ease-out;">
      <img src="${post.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" class="post-card-image" alt="${post.title}">
      <div class="post-card-content">
        <h4 class="post-card-title">${post.title}</h4>
        <p class="post-card-desc">${post.desc}</p>
        <div class="post-card-meta">
          <span class="post-cat-label">مقالات</span>
          <span class="post-meta-dot">•</span>
          <span class="post-date-label">${formatDateToArabic(post.date)}</span>
        </div>
      </div>
    </a>
  `,
    )
    .join("");
};

// 🎯 دالة مساعدة لإنشاء كروت المنتجات بناءً على المسار الذكي الجديد
const generateProductsHtml = (products) => {
  return products
    .map(
      (prod) => `
    <a href="${getSmartRoute(prod, "product")}" class="product-card-item" data-link title="${prod.title}">
      <img src="${prod.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${prod.title}">
    </a>
  `,
    )
    .join("");
};

export const PersonDetailsPage = (id) => {
  const person = searchDatabase.find(
    (item) => item.id == id && item.type === "people",
  );
  if (!person)
    return `<div class="error-view"><h1>هذا الشخص غير موجود!</h1></div>`;

  const d = person.details;
  // جلب كل المنتجات اللي العضو مشترك فيها
  const personProducts = searchDatabase.filter(
    (item) =>
      item.type === "products" && item.details.teamIds.includes(person.id),
  );

  // 🎯 إعداد وضع الـ "عرض الكل" (بشكل افتراضي بنعرض أول 6 مشاريع فقط)
  const LIMIT = 6;
  const hasMoreThanLimit = personProducts.length > LIMIT;
  const initialProducts = hasMoreThanLimit
    ? personProducts.slice(0, LIMIT)
    : personProducts;
  const productsHtml = generateProductsHtml(initialProducts);

  // 📋 جلب المنشورات لمعرفة الطول والـ Fallback للـ Navbar
  const checkPosts = searchDatabase.filter(
    (item) => item.type === "tags" && item.authorId == person.id,
  );
  const isFallbackDisabled = checkPosts.length === 0 ? "disabled" : "";

  // ⚡ ربط الـ Event Listener ديناميكياً بعد الريندر للتحكم في عرض المزيد/الأقل بنفس حركة الرئيسية
  setTimeout(() => {
    const toggleProductsBtn = document.getElementById("toggle-person-products-btn");
    const gridLayout = document.querySelector(".products-grid-layout");

    if (toggleProductsBtn && gridLayout) {
      let isExpanded = false;

      toggleProductsBtn.addEventListener("click", () => {
        const currentText = isExpanded ? "عرض أقل" : "عرض الكل";
        toggleProductsBtn.innerHTML = `
        <span class="sort-spinner"></span>
        <span>${currentText}</span>
        `;
        toggleProductsBtn.style.pointerEvents = "none";

        setTimeout(() => {
          isExpanded = !isExpanded;
          
          if (isExpanded) {
            gridLayout.innerHTML = generateProductsHtml(personProducts);
            toggleProductsBtn.innerHTML = `<span>عرض أقل</span>`;
            toggleProductsBtn.classList.add("less-active");
          } else {
            gridLayout.innerHTML = generateProductsHtml(initialProducts);
            toggleProductsBtn.innerHTML = `<span>عرض الكل</span>`;
            toggleProductsBtn.classList.remove("less-active");
          }
          
          toggleProductsBtn.style.pointerEvents = "auto";
        }, 300);
      });
    }
  }, 10);

  return `
    <div class="person-wrapper">
        <div class="hero-card-container">
          <div class="hero-profile-identity-block">
            <img src="${person.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" class="user-avatar-frame" alt="${person.title}">
            <div class="hero-name-details">
              <div class="hero-name-row">
                <h1>${person.title}</h1>
                ${
                  d.isOwner
                    ? `
                <svg class="verified-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.92 8.6 1.5 6.71 4.7l-3.61.81.34 3.68L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2 3.4-1.42 3.4 1.41 1.89-3.2 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>`
                    : ""
                }
              </div>
              <div class="hero-stats-row">
                <span class="stat-badge">${d.role}</span>
                <span class="stat-badge projects-badge">${personProducts.length} منتج</span>
              </div>
              <p class="hero-bio-text">${d.bio}</p>
              <div class="social-left-aside">
                ${d.social?.github && d.social.github.trim() !== "" && d.social.github !== "#" ? `<a href="${d.social.github}" target="_blank" title="GitHub"><img width="24" height="24" src="/src/assets/icons/github.svg" alt="GitHub"></a>` : ""}
                ${d.social?.linkedin && d.social.linkedin.trim() !== "" && d.social.linkedin !== "#" ? `<a href="${d.social.linkedin}" target="_blank" title="LinkedIn"><img width="24" height="24" src="/src/assets/icons/linkedin.svg" alt="LinkedIn"></a>` : ""}
                ${d.social?.facebook && d.social.facebook.trim() !== "" && d.social.facebook !== "#" ? `<a href="${d.social.facebook}" target="_blank" title="Facebook"><img width="24" height="24" src="/src/assets/icons/facebook.svg" alt="Facebook"></a>` : ""}
                ${d.social?.instagram && d.social.instagram.trim() !== "" && d.social.instagram !== "#" ? `<a href="${d.social.instagram}" target="_blank" title="Instagram"><img width="24" height="24" src="/src/assets/icons/instagram.svg" alt="Instagram"></a>` : ""}
                ${d.social?.tiktok && d.social.tiktok.trim() !== "" && d.social.tiktok !== "#" ? `<a href="${d.social.tiktok}" target="_blank" title="TikTok"><img width="24" height="24" src="/src/assets/icons/tiktok.svg" alt="TikTok"></a>` : ""}
              </div>
            </div>
          </div>
        </div>

        <div class="section-header-row">
          <h2>المنتجات</h2>
          ${
            hasMoreThanLimit
              ? `
            <button id="toggle-person-products-btn" class="view-all-link">
              <span>عرض الكل</span>
            </button>
          `
              : ""
          }
        </div>
        
        <div class="products-grid-layout">
          ${productsHtml || `<div class="empty-posts-state"><p class="empty-state-text">لم يساهم في مشاريع رقمية بعد.</p></div>`}
        </div>

        <div class="posts-filter-navbar">
          <div class="filter-tabs-group">
            <button class="filter-tab-btn" style="${checkPosts.length === 0 ? "opacity: .5;" : "font-weight: 700;"}">
              ${checkPosts.length} منشور
            </button>
          </div>
          
          <button class="sort-dropdown-trigger sort-person-posts-btn ${isFallbackDisabled}" data-person-id="${person.id}" data-order="latest">
            <span>الأحدث</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>
        </div>
        
        <div id="person-posts-container" class="person-posts-grid-system">
          ${renderPersonPosts(person.id, "latest")}
        </div>
    </div>
  `;
};