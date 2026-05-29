import { searchDatabase } from "../data/searchData.js";

// متغيرات حالة الفلترة، التترتيب، وحالة المنتجات
let currentCategory = "all";
let currentSortOrder = "latest";
let isAllProductsExpanded = false; // 📦 حالة فرد/لم المنتجات

// 🔄 دالة جلب عدد المتابعين من جوجل شيت وتحديث الواجهة
const fetchLiveFollowers = async () => {
  const followersText = document.getElementById("live-followers-text");
  if (!followersText) return;

  const googleScriptUrl =
    "https://script.google.com/macros/s/AKfycbwZ7YRjFHPRIHAjdfmbCMW-3iW5P21yGbv1IC_7LVs8UyM6rkCqXmRKGM5DV5Flnq5M/exec";

  try {
    const response = await fetch(googleScriptUrl);
    const data = await response.json();

    if (data && data.followers !== undefined) {
      followersText.textContent = `${data.followers} متابع `;
    }
  } catch (error) {
    followersText.textContent = `مشكلة في جلب المتابعين`;
  }
};

// 🕵️ دالة جلب وحساب المنشورات بناءً على الفلتر والترتيب ديناميكياً
export const renderHomePosts = () => {
  let posts = searchDatabase.filter(
    (p) => p.type === "tags" && p.authorId === 0,
  );

  if (currentCategory === "tech") {
    posts = posts.filter(
      (p) =>
        p.postCategory === "tech" ||
        p.desc.includes("تقني") ||
        p.title.includes("تقني"),
    );
  } else if (currentCategory === "sports") {
    posts = posts.filter(
      (p) =>
        p.postCategory === "sports" ||
        p.desc.includes("رياضة") ||
        p.title.includes("رياضة"),
    );
  }

  posts.sort((a, b) => {
    return currentSortOrder === "latest"
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });

  if (posts.length === 0) {
    return `
      <div class="empty-posts-state">
        <img class="empty-state-icon" src="/src/assets/icons/noresualt.svg" alt="لا توجد منشورات">
        <p class="empty-state-text">لا توجد منشورات</p>
      </div>
    `;
  }

  // دالة مساعدة لتنسيق التاريخ (20 مايو 2026)
  const formatArabicDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  return posts
    .map((post) => {
      // ترجمة نوع الفئة الخاصة بالمنشور
      const categoryLabel = post.postCategory === "tech" ? "منشور تقني" : "منشور رياضي";

      // 🎯 توليد الرابط الذكي
      const smartPostRoute = post.username ? `/@${post.username.toLowerCase()}` : `/tag/${post.id}`;

      return `
        <a href="${smartPostRoute}" class="post-item-card" data-link>
          <img src="${post.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" class="post-card-image" alt="${post.title}">
          
          <div class="post-card-content">
            <h4 class="post-card-title">${post.title}</h4>
            <p class="post-card-desc">${post.desc}</p>
            <div class="post-card-meta">
              <span class="post-cat-label">${categoryLabel}</span>
              <span class="post-meta-dot">•</span>
              <span class="post-date-label">${formatArabicDate(post.date)}</span>
            </div>
          </div>
        </a>
      `;
    })
    .join("");
};

// 📦 دالة رندر المنتجات
const renderHomeProducts = () => {
  const myProducts = searchDatabase.filter((p) => p.type === "products");
  const visibleProducts = isAllProductsExpanded
    ? myProducts
    : myProducts.slice(0, 6);

  return visibleProducts
    .map(
      (prod) => `
    <a href="/@${prod.username}" class="product-card-item" data-link title="${prod.title}">
      <img src="${prod.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${prod.title}">
    </a>
  `,
    )
    .join("");
};

// 🔄 دالة تشغيل المستمعات
export const initHomeListeners = () => {
  fetchLiveFollowers();

  const getAllCount = () =>
    searchDatabase.filter((p) => p.type === "tags" && p.authorId === 0).length;
  const getTechCount = () =>
    searchDatabase.filter(
      (p) =>
        p.type === "tags" &&
        p.authorId === 0 &&
        (p.postCategory === "tech" ||
          p.desc.includes("تقني") ||
          p.title.includes("تقني")),
    ).length;
  const getSportsCount = () =>
    searchDatabase.filter(
      (p) =>
        p.type === "tags" &&
        p.authorId === 0 &&
        (p.postCategory === "sports" ||
          p.desc.includes("رياضة") ||
          p.title.includes("رياضة")),
    ).length;

  // 🎯 المستمع العام المطور لإظهار وإغلاق الـ Popup بسلاسة ودون تعليق
  if (!window.hasFollowListener) {
    document.addEventListener("click", (e) => {
      // رصد أي زر يحمل الـ ID أو الكلاسات الخاصة بالمتابعة في الرئيسية أو الناف بار
      const followBtnBottom = e.target.closest("#hero-follow-btn-bottom") || e.target.closest("#follow-btn") || e.target.closest(".open-follow") || e.target.closest(".follow-btn");

      // 1. منطق الفتح عند الضغط على زر المتابعة (فقط لو مش subscribed)
      if (
        followBtnBottom &&
        !followBtnBottom.classList.contains("subscribed")
      ) {

        if (typeof window.openFollowPopup === "function") {
          window.openFollowPopup();
          return;
        }

        const overlay = document.querySelector(".popup-overlay");
        if (overlay) {
          overlay.style.setProperty("display", "block", "important");
          overlay.style.setProperty("opacity", "1", "important");
          overlay.style.setProperty("pointer-events", "auto", "important");
          overlay.classList.add("active", "show", "open");
        }

        const innerPopup = document.querySelector(".follow-popup");
        if (innerPopup) {
          innerPopup.style.setProperty("display", "block", "important");
          innerPopup.style.setProperty("opacity", "1", "important");
          innerPopup.style.setProperty("visibility", "visible", "important");
          innerPopup.style.setProperty("z-index", "3000", "important");
          innerPopup.style.setProperty("top", "50%", "important");
          innerPopup.style.setProperty("left", "50%", "important");
          innerPopup.style.setProperty(
            "transform",
            "translate(-50%, -50%)",
            "important",
          );
          innerPopup.classList.add("active", "show", "open");
        }
        return;
      }

      // 2. منطق القفل عند الضغط على زر الإغلاق أو التعتيم الخارجي
      const closeBtn =
        e.target.closest(".close-popup-btn") ||
        e.target.closest("[data-close-popup]") ||
        e.target.closest(".close-btn");
      const clickedOverlay = e.target.matches(".popup-overlay") || e.target.matches("#popup-overlay");

      if (closeBtn || clickedOverlay) {
        const overlay = document.querySelector(".popup-overlay") || document.getElementById("popup-overlay");
        const innerPopup = document.querySelector(".follow-popup") || document.getElementById("follow-popup");

        if (overlay) {
          overlay.style.removeProperty("display");
          overlay.style.removeProperty("opacity");
          overlay.style.removeProperty("pointer-events");
          overlay.classList.remove("active", "show", "open");
        }

        if (innerPopup) {
          innerPopup.style.removeProperty("display");
          innerPopup.style.removeProperty("opacity");
          innerPopup.style.removeProperty("visibility");
          innerPopup.style.removeProperty("z-index");
          innerPopup.style.removeProperty("top");
          innerPopup.style.removeProperty("left");
          innerPopup.style.removeProperty("transform");
          innerPopup.classList.remove("active", "show", "open");
        }
      }
    });
    window.hasFollowListener = true;
  }

  // 🔄 تحديث الأزرار فوراً عند نجاح الاشتراك واختفاء الفقعة
  window.addEventListener("subscriptionSuccess", () => {
    fetchLiveFollowers();
    // استدعاء الدالة الموحدة الموجودة في الناف بار/الملف الرئيسي لتحديث الكل معاً
    if (typeof window.syncFollowButtonsState === "function") {
      window.syncFollowButtonsState();
    }
  });

  // 🎯 مستمع زر "عرض الكل / عرض أقل" المطور مع الـ Spinner والـ Delay
  const toggleProductsBtn = document.getElementById("toggle-products-btn");
  if (toggleProductsBtn) {
    toggleProductsBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (toggleProductsBtn.style.pointerEvents === "none") return;
      toggleProductsBtn.style.pointerEvents = "none";

      const originalContent = toggleProductsBtn.innerHTML;
      toggleProductsBtn.innerHTML =
        `<span class="sort-spinner"></span>` + originalContent;

      setTimeout(() => {
        isAllProductsExpanded = !isAllProductsExpanded;

        if (isAllProductsExpanded) {
          toggleProductsBtn.classList.add("less-active");
          toggleProductsBtn.innerHTML = `<span>عرض أقل</span>`;
        } else {
          toggleProductsBtn.classList.remove("less-active");
          toggleProductsBtn.innerHTML = `<span>عرض الكل</span>`;
        }

        document.getElementById("home-products-container").innerHTML =
          renderHomeProducts();
        toggleProductsBtn.style.pointerEvents = "auto";
      }, 400);
    });
  }

  // مستمعات أزرار تبويبات الفئات
  const tabs = document.querySelectorAll(".filter-tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      tabs.forEach((t) => {
        t.classList.remove("active-tab");
        const cat = t.dataset.category;
        if (cat === "all") t.textContent = "الكل";
        if (cat === "tech") t.textContent = "التقنية";
        if (cat === "sports") t.textContent = "الرياضة";
      });

      const currentTab = e.currentTarget;
      currentTab.classList.add("active-tab");
      currentCategory = currentTab.dataset.category;

      if (currentCategory === "all") {
        currentTab.textContent = `الكل ${getAllCount()}`;
      } else if (currentCategory === "tech") {
        currentTab.textContent = `التقنية ${getTechCount()}`;
      } else if (currentCategory === "sports") {
        currentTab.textContent = `الرياضة ${getSportsCount()}`;
      }

      document.getElementById("home-posts-container").innerHTML =
        renderHomePosts();
    });
  });

  // منطق الأحدث والأقدم المطور مع الـ Spinner والـ Delay
  const sortBtn = document.getElementById("sort-posts-btn");
  if (sortBtn) {
    sortBtn.addEventListener("click", () => {
      if (sortBtn.style.pointerEvents === "none") return;
      sortBtn.style.pointerEvents = "none";

      const originalContent = sortBtn.innerHTML;
      sortBtn.innerHTML =
        `<span class="sort-spinner"></span>` + originalContent;

      setTimeout(() => {
        if (currentSortOrder === "latest") {
          currentSortOrder = "oldest";
          sortBtn.classList.add("oldest-active");
          sortBtn.innerHTML = `
            <span>الأقدم</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
          `;
        } else {
          currentSortOrder = "latest";
          sortBtn.classList.remove("oldest-active");
          sortBtn.innerHTML = `
            <span>الأحدث</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          `;
        }

        document.getElementById("home-posts-container").innerHTML =
          renderHomePosts();
        sortBtn.style.pointerEvents = "auto";
      }, 400);
    });
  }
};

const HomePage = () => {
  const allPostsCount = searchDatabase.filter(
    (p) => p.type === "tags" && p.authorId === 0,
  ).length;
  const allProjectsCount = searchDatabase.filter(
    (p) => p.type === "products",
  ).length;

  const me = searchDatabase.find((p) => p.id === 0) || {
    title: "محمد منصور حسن",
    img: "/src/assets/avatar.png",
    details: {
      bio: "أنا محمد منصور، مطور واجهات أمامية أدرس بكلية الحاسبات والمعلومات، وأهتم ببناء مواقع إلكترونية وإنتاجات رقمية بسيطة وواضحة وترتكز هي على التفاصيل أكثر من مجرد محتوى على الانترنت .",
    },
  };

  // 🎯 تعديل المفتاح هنا ليصبح الموحد في المشروع بالكامل لثبات الحالة
  const isSubscribed = localStorage.getItem("isSubscribed") === "true";

  setTimeout(() => {
    initHomeListeners();
    // مزامنة الأزرار فوراً بعد بناء مكون الصفحة
    if (typeof window.syncFollowButtonsState === "function") {
      window.syncFollowButtonsState();
    }
  }, 50);

  return /*html*/ `
    <div class="home-wrapper">
      
      <section class="hero-card-container" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="hero-profile-identity-block">
          <img class="user-avatar-frame" src="${me.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${me.title}" style="flex-shrink: 0;">
          
          <div class="hero-name-details">
            <div class="hero-name-row">
              <h1>${me.title}</h1>
              <svg class="verified-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.92 8.6 1.5 6.71 4.7l-3.61.81.34 3.68L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2 3.4-1.42 3.4 1.41 1.89-3.2 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </div>
            
            <div class="hero-stats-row">
              <span class="stat-badge">${allPostsCount} منشور</span>
              <span class="stat-badge projects-badge">${allProjectsCount} مشروع</span>
              <span class="stat-followers-text" id="live-followers-text">جاري جلب المتابعين ..</span>
            </div>

            <div class="social-left-aside">
              <a href="https://github.com/mohamedmansour277" title="GitHub">
                <img width="24" height="24" src="/src/assets/icons/github.svg" alt="GitHub">
              </a>
              <a href="https://www.linkedin.com/in/mohamed-mansour27" title="LinkedIn">
                <img width="24" height="24" src="/src/assets/icons/linkedin.svg" alt="LinkedIn">
              </a>
              <a href="https://www.facebook.com/share/16uisah4Fm/?mibextid=wwXIfr" title="Facebook">
                <img width="24" height="24" src="/src/assets/icons/facebook.svg" alt="Facebook">
              </a>
              <a href="https://www.instagram.com/mohamed27.k" title="Instagram">
                <img width="24" height="24" src="/src/assets/icons/instagram.svg" alt="Instagram">
              </a>
              <a href="https://www.tiktok.com/@mohamed27.k?_r=1&_t=ZS-96gOiqdjD9e" title="TikTok">
                <img width="24" height="24" src="/src/assets/icons/tiktok.svg" alt="TikTok">
              </a>
            </div>

            <p class="hero-bio-text">${me.details.bio}</p>
          </div>
        </div>

        <div class="hero-bottom-content" style="display: flex; justify-content: flex-start; width: 100%;">
          <button id="hero-follow-btn-bottom" class="hero-follow-btn ${isSubscribed ? "subscribed" : ""}" style="position: relative; cursor: pointer;">
            ${
              isSubscribed
                ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 5px;"><polyline points="20 6 9 17 4 12"></polyline></svg><span>متابع</span>`
                : `+ تابع`
            }
          </button>
        </div>
      </section>

      <section>
        <div class="section-header-row">
          <h2>المنتجات</h2>
          <button id="toggle-products-btn" class="view-all-link">
            <span>عرض الكل</span>
          </button>
        </div>
        <div class="products-grid-layout" id="home-products-container">
          ${renderHomeProducts()}
        </div>
      </section>

      <section>
        <div class="posts-filter-navbar">
          <div class="filter-tabs-group">
            <button class="filter-tab-btn active-tab" data-category="all">الكل ${allPostsCount}</button>
            <button class="filter-tab-btn" data-category="tech">التقنية</button>
            <button class="filter-tab-btn" data-category="sports">الرياضة</button>
          </div>
          
          <button id="sort-posts-btn" class="sort-dropdown-trigger" data-order="latest">
            <span>الأحدث</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </button>
        </div>

        <div id="home-posts-container">
          ${renderHomePosts()}
        </div>
      </section>

    </div>
  `;
};

export default HomePage;