// 1️⃣ استيراد الصفحات الثابتة والديناميكية وقاعدة البيانات
import HomePage from "/src/pages/home.js";
import NotFoundPage from "/src/pages/notfound.js";
import { searchpage } from "/src/pages/searchpage.js";
import { searchDatabase } from "/src/data/searchData.js";

import { PersonDetailsPage } from "/src/pages/details/personDetails.js";
import { ProductDetailsPage } from "/src/pages/details/productDetails.js";
import { TagDetailsPage } from "/src/pages/details/tagDetails.js";

// 2️⃣ خريطة المسارات الثابتة للموقع
const pages = {
  "/": HomePage,
  "/404": NotFoundPage,
};

// ─── دالة إنشاء الفقاعات الإشعارية (للأخطاء التقنية فقط) ────────────────
const showToast = (message, type = "info", duration = 3000) => {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      direction: rtl;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.style.cssText = `
    background: ${type === "error" ? "#ef4444" : "#1f2937"};
    color: #fff;
    padding: 12px 20px;
    border-radius: 99px;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
    backdrop-filter: blur(8px);
  `;
  
  toast.innerText = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0) scale(1)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px) scale(0.95)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ─── 💬 فقاعة تأكيد إلغاء المتابعة المخصصة (بديل الـ confirm) ──────────────
const showConfirmBubble = (message, onConfirm) => {
  const existingBubble = document.getElementById("confirm-bubble");
  if (existingBubble) existingBubble.remove();

  const overlay = document.createElement("div");
  overlay.id = "confirm-bubble";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.25s ease;
    direction: rtl;
  `;

  const card = document.createElement("div");
  card.style.cssText = `
    background: #ffffff;
    border-radius: 20px;
    padding: 24px;
    width: 90%;
    max-width: 340px;
    text-align: center;
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
    transform: scale(0.9);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  card.innerHTML = `
    <p style="margin: 0 0 20px 0; font-size: 1rem; color: #1f2937; font-weight: 600; line-height: 1.5;">${message}</p>
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="confirm-yes-btn" style="font-family: var(--mainFont); flex: 1; padding: 10px ; border: none; background: #0b0a0a; color: white; border-radius: 8px; font-weight: bold; cursor: pointer;">إلغاء المتابعة</button>
      <button id="confirm-no-btn" style="font-family: var(--mainFont); flex: 1; padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; color: #374151; border-radius: 8px; font-weight: bold; cursor: pointer;">تراجع</button>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    card.style.transform = "scale(1)";
  });

  const close = () => {
    overlay.style.opacity = "0";
    card.style.transform = "scale(0.9)";
    setTimeout(() => overlay.remove(), 250);
  };

  card.querySelector("#confirm-yes-btn").onclick = () => {
    close();
    onConfirm();
  };
  card.querySelector("#confirm-no-btn").onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
};

// ─── دالات التحكم في خط التحميل العلوي (TOP LOADING BAR) ─────────────────
const startLoadingBar = () => {
  const bar = document.getElementById("top-loading-bar");
  if (!bar) return;
  bar.style.opacity = "1";
  bar.style.width = "70%";
};

const finishLoadingBar = () => {
  const bar = document.getElementById("top-loading-bar");
  if (!bar) return;
  bar.style.width = "100%";

  setTimeout(() => {
    bar.style.opacity = "0";
    setTimeout(() => {
      bar.style.width = "0%";
    }, 300);
  }, 200);
};
// ─────────────────────────────────────────────────────────────────────────

// 🌟 [دالة تحديث أزرار المتابعة الموحدة والستايل المشترك]
const updateFollowButtons = () => {
  const isSubscribed = localStorage.getItem("isSubscribed") === "true";
  const followButtons = document.querySelectorAll("#follow-btn, .open-follow, .follow-btn, #hero-follow-btn-bottom");
  
  const mainHeroBadgeHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 5px; display: inline-block; vertical-align: middle;">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>متابع</span>
  `;

  const navbarBadgeHTML = `<span>متابع</span>`;

  followButtons.forEach((btn) => {
    if (btn.id === "submit-subscribe-btn") return;

    if (isSubscribed) {
      if (btn.id === "hero-follow-btn-bottom") {
        btn.innerHTML = mainHeroBadgeHTML;
      } else {
        btn.innerHTML = navbarBadgeHTML;
      }
      btn.classList.add("subscribed");
    } else {
      if (btn.id === "hero-follow-btn-bottom") {
         btn.innerHTML = `+ تابــع`;
      } else {
         btn.innerHTML = `<span>تابــع</span>`;
      }
      btn.classList.remove("subscribed");
    }
  });
};

window.syncFollowButtonsState = updateFollowButtons;

window.openFollowPopup = () => {
  const overlay = document.getElementById("popup-overlay");
  const popup = document.getElementById("follow-popup");
  
  if (overlay && popup) {
    overlay.classList.add("show", "active", "open");
    popup.classList.add("show", "active", "open");
    document.body.style.overflow = "hidden";
  }
};

window.closeFollowPopup = () => {
  const overlay = document.getElementById("popup-overlay");
  const popup = document.getElementById("follow-popup");

  if (overlay && popup) {
    overlay.classList.remove("show", "active", "open");
    popup.classList.remove("show", "active", "open");
    document.body.style.overflow = "auto";
  }
};

// 3️⃣ الراوتر لتغيير الصفحات بدون إعادة تحميل (SPA Router)
const router = () => {
  let currentPath = window.location.pathname;
  const mainContent = document.getElementById("main-content");

  if (
    currentPath === "/" ||
    currentPath.includes("index.html") ||
    window.location.protocol === "file:"
  ) {
    currentPath = "/";
  }

  if (currentPath.startsWith("/search")) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q") || "";
    if (mainContent) mainContent.innerHTML = searchpage(query);
    updateFollowButtons(); 
    finishLoadingBar();
    return;
  }

  let renderedHtml = null;

  if (currentPath.startsWith("/@")) {
    const username = currentPath.split("/@")[1]?.toLowerCase();
    
    const person = searchDatabase.find(
      (item) => item.type === "people" && item.username?.toLowerCase() === username
    );

    if (person) {
      if (person.id == 0) {
        navigateTo("/");
        return;
      }
      renderedHtml = PersonDetailsPage(person.id);
    }

    if (!renderedHtml) {
      const product = searchDatabase.find(
        (item) => item.type === "products" && item.username?.toLowerCase() === username
      );
      if (product) {
        renderedHtml = ProductDetailsPage(product.id);
      }
    }

    if (!renderedHtml) {
      const tag = searchDatabase.find(
        (item) => item.type === "tags" && item.username?.toLowerCase() === username
      );
      if (tag) {
        renderedHtml = TagDetailsPage(tag.id);
      }
    }

    if (!renderedHtml) {
      currentPath = "/404";
    }
  }

  if (!renderedHtml && currentPath.startsWith("/product/")) {
    const id = currentPath.split("/")[2];
    renderedHtml = ProductDetailsPage(id);
  }

  if (!renderedHtml && currentPath.startsWith("/tag/")) {
    const id = currentPath.split("/")[2];
    renderedHtml = TagDetailsPage(id);
  }

  if (mainContent) {
    if (renderedHtml) {
      mainContent.innerHTML = renderedHtml;
    } else {
      const activePage = pages[currentPath] || pages["/404"];
      mainContent.innerHTML = typeof activePage === "function" ? activePage() : activePage;
    }
  }

  updateFollowButtons();
  finishLoadingBar();
};

const navigateTo = (url) => {
  startLoadingBar();
  window.history.pushState(null, null, url);

  setTimeout(() => {
    window.scrollTo(0, 0);
    router();
  }, 300);
};

// 4️⃣ إعداد محرك البحث
const setupSearch = () => {
  const input = document.getElementById("search-input");
  const dropdown = document.getElementById("search-dropdown");
  const btn = document.getElementById("search-btn");
  const container = document.querySelector(".search-container");

  if (!input || !dropdown || !btn || !container) return;

  const categories = {
    people: "الأشخاص",
    products: "المنتجات",
    tags: "الوسوم",
  };

  const getRouteUrl = (item) => {
    if (item.username) {
      return `/@${item.username.toLowerCase()}`;
    }
    if (item.type === "people") return `/person/${item.id}`;
    if (item.type === "products") return `/product/${item.id}`;
    return `/tag/${item.id}`;
  };

  input.addEventListener("input", (e) => {
    const value = e.target.value.trim().toLowerCase();

    if (!value) {
      dropdown.style.display = "none";
      dropdown.innerHTML = "";
      return;
    }

    const results = searchDatabase.filter(
      (item) =>
        item.title.toLowerCase().includes(value) ||
        item.desc?.toLowerCase().includes(value)
    );

    if (results.length === 0) {
      dropdown.innerHTML = `
        <div class="no-results" style="text-align: center; padding: 20px 10px;">
          <img style="width: 100px; margin-bottom: 10px;" src="/src/assets/icons/noresualt.svg" alt="no-results">
          <p style="margin: 0; font-size: 0.9rem; color: rgba(0, 0, 0, 0.2); font-weight: bold;">لا توجد نتائج</p>
        </div>
      `;
      dropdown.style.display = "block";
      return;
    }

    let html = "";
    Object.keys(categories).forEach((cat) => {
      const catItems = results.filter((item) => item.type === cat);
      if (catItems.length > 0) {
        html += `<div class="search-category-title">${categories[cat]} (${catItems.length})</div>`;
        catItems.forEach((item) => {
          html += `
            <a href="${getRouteUrl(item)}" class="search-item" data-link>
              <img src="${item.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';">
              <div class="search-item-info">
                <h4>${item.title}</h4>
              </div>
            </a>
          `;
        });
      }
    });

    dropdown.innerHTML = `
      <div class="search-results-scrollable">
        ${html}
      </div>
      <a href="/search?q=${encodeURIComponent(value)}" class="view-all-results-btn" data-link>
        <span>عرض كل النتائج (${results.length})</span>
      </a>
    `;
    
    dropdown.style.display = "block";
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const query = input.value.trim();

    if (window.innerWidth <= 500) {
      const isMobileActive = container.classList.contains("mobile-active");
      if (!isMobileActive) {
        container.classList.add("mobile-active");
        input.focus();
      } else {
        if (query) {
          dropdown.style.display = "none";
          container.classList.remove("mobile-active");
          navigateTo(`/search?q=${encodeURIComponent(query)}`);
        } else {
          container.classList.remove("mobile-active");
          dropdown.style.display = "none";
        }
      }
      return;
    }

    const isExpanded = container.classList.contains("active");
    if (!isExpanded) {
      container.classList.add("active");
      input.focus();
    } else {
      if (query) {
        dropdown.style.display = "none";
        navigateTo(`/search?q=${encodeURIComponent(query)}`);
      } else {
        input.focus();
        container.classList.add("search-alert-active");
        setTimeout(() => {
          container.classList.remove("search-alert-active");
        }, 500);
      }
    }
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      dropdown.style.display = "none";
      container.classList.remove("mobile-active");
      navigateTo(`/search?q=${encodeURIComponent(input.value.trim())}`);
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      dropdown.style.display = "none";
      container.classList.remove("mobile-active");
      if (input.value.trim() === "") {
        container.classList.remove("active");
      }
    }
  });
};

// 5️⃣ ربط أحداث الـ Validation والـ Dynamic Delegation
document.addEventListener("DOMContentLoaded", () => {
  
  const validateEmailFormat = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  document.body.addEventListener("input", (e) => {
    if (e.target.id === "user-name") {
      const nameInput = e.target;
      const nameError = document.getElementById("name-error");
      const value = nameInput.value.trim();
      const hasEnglish = /[a-zA-Z]/.test(value);

      if (nameError) {
        if (hasEnglish) {
          nameError.textContent = "بالعربي الله يخليك";
          nameError.classList.add("show-error");
        } else {
          nameError.classList.remove("show-error");
          nameError.textContent = "";
        }
      }
    }

    if (e.target.id === "user-email") {
      const emailInput = e.target;
      const emailError = document.getElementById("email-error");
      const value = emailInput.value.trim();

      if (emailError) {
        if (value.length > 0 && validateEmailFormat(value)) {
          emailError.classList.remove("show-error");
          emailError.textContent = "";
        }
      }
    }
  });

  document.body.addEventListener("submit", async (e) => {
    if (e.target.id !== "newsletter-form") return;
    
    e.preventDefault();
    const form = e.target;
    const nameInput = document.getElementById("user-name");
    const emailInput = document.getElementById("user-email");
    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const submitBtn = document.getElementById("submit-subscribe-btn");

    let isValid = true;
    const nameValue = nameInput ? nameInput.value.trim() : "";
    const emailValue = emailInput ? emailInput.value.trim() : "";

    if (nameValue === "") {
      if (nameError) {
        nameError.textContent = "اسمك الأول يا حبيب";
        nameError.classList.add("show-error");
      }
      isValid = false;
    } else if (/[a-zA-Z]/.test(nameValue)) {
      if (nameError) {
        nameError.textContent = "بالعربي الله يخليك";
        nameError.classList.add("show-error");
      }
      isValid = false;
    }

    if (emailValue === "") {
      if (emailError) {
        emailError.textContent = "ممكن بريدك";
        emailError.classList.add("show-error");
      }
      isValid = false;
    } else if (!validateEmailFormat(emailValue)) {
      if (emailError) {
        emailError.textContent = "اكتب البريد بصيغة صحيحة";
        emailError.classList.add("show-error");
      }
      isValid = false;
    }

    if (!isValid) return;

    let originalText = "";
    if (submitBtn) {
      submitBtn.disabled = true;
      originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>جاري الحفظ...</span>";
    }

    const data = new FormData(form);

    try {
      const urlEncodedData = new URLSearchParams(data).toString();

      const response = await fetch(form.action, {
        method: form.method,
        body: urlEncodedData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const result = await response.json();

      if (result.result === "exists") {
        if (emailError) {
          emailError.textContent = "الإيميل مسجل بالفعل";
          emailError.classList.add("show-error");
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        return;
      }

      if (result.result === "success") {
        localStorage.setItem("isSubscribed", "true");
        updateFollowButtons();

        form.reset();
        window.dispatchEvent(new Event("subscriptionSuccess"));

        // إغلاق البوب أب بدون رسائل إشعار
        window.closeFollowPopup();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      } else {
        showToast("عذراً، حدث خطأ أثناء حفظ البيانات.", "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    } catch (error) {
      showToast("فشل الاتصال، يرجى التحقق من جودة الإنترنت لديك.", "error");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  });

  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".userLogo")) {
      e.preventDefault();
      navigateTo("/");
      return;
    }

    const followBtnTarget = e.target.closest("#follow-btn, .open-follow, .follow-btn, #hero-follow-btn-bottom");

    if (followBtnTarget) {
      if (e.target.id === "submit-subscribe-btn" || e.target.closest("#submit-subscribe-btn")) {
        return;
      }

      e.preventDefault();

      const isSubscribed = localStorage.getItem("isSubscribed") === "true";

      if (isSubscribed) {
        // 🎯 فتح فقاعة التأكيد المخصصة بدلاً من confirm المتصفح
        showConfirmBubble("هل تريد إلغاء متابعة محمد منصور؟", () => {
          localStorage.removeItem("isSubscribed");
          updateFollowButtons();
        });
        return;
      }

      window.openFollowPopup();
      return;
    }

    if (
      e.target.closest("#close-popup-btn") || 
      e.target.closest(".close-popup") || 
      e.target.classList.contains("popup-overlay")
    ) {
      window.closeFollowPopup();
      return;
    }

    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const dropdown = document.getElementById("search-dropdown");
      if (dropdown) dropdown.style.display = "none";
      navigateTo(link.getAttribute("href"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.closeFollowPopup();
  });

  setupSearch();
  router(); 
});

window.addEventListener("popstate", router);