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
// 🌟 [دالة تحديث أزرار المتابعة الموحدة والستايل المشترك بدون علامة صح في الناف بار]
const updateFollowButtons = () => {
  // توحيد قراءة المفتاح ليطابق home.js وهو isSubscribed
  const isSubscribed = localStorage.getItem("isSubscribed") === "true";
  
  // لقط كل أزرار المتابعة المتاحة في الـ DOM
  const followButtons = document.querySelectorAll("#follow-btn, .open-follow, .follow-btn, #hero-follow-btn-bottom");
  
  // الكود الخاص بزر الصفحة الرئيسية (يحتوي على علامة الصح)
  const mainHeroBadgeHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 5px; display: inline-block; vertical-align: middle;">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>متابع</span>
  `;

  // الكود الخاص بزر الناف بار (نص فقط "متابع" بدون أيقونة الصح)
  const navbarBadgeHTML = `<span>متابع</span>`;

  followButtons.forEach((btn) => {
    if (isSubscribed) {
      // فحص إذا كان الزرار هو زر الصفحة الرئيسية السفلي
      if (btn.id === "hero-follow-btn-bottom") {
        btn.innerHTML = mainHeroBadgeHTML;
      } else {
        // أي زرار آخر (مثل زر الناف بار) ياخذ نص فقط
        btn.innerHTML = navbarBadgeHTML;
      }
      btn.classList.add("subscribed"); // توحيد الكلاس ليكون subscribed في كل مكان
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

// جعل الدالة ومثيلات الفتح متاحة عالمياً على نطاق الـ window لمنع أي تعارض مستقبلي
window.syncFollowButtonsState = updateFollowButtons;
window.openFollowPopup = () => {
  const overlay = document.getElementById("popup-overlay") || document.querySelector(".popup-overlay");
  const popup = document.getElementById("follow-popup") || document.querySelector(".follow-popup");
  if (localStorage.getItem("isSubscribed") === "true") return;

  if (overlay && popup) {
    overlay.classList.add("show", "active", "open");
    popup.classList.add("show", "active", "open");
    document.body.style.overflow = "hidden";
  }
};


// 3️⃣ الدالة المسؤولة عن التوجيه وعرض المحتوى المناسب (The Router)
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
    mainContent.innerHTML = searchpage(query);
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

  if (renderedHtml) {
    mainContent.innerHTML = renderedHtml;
  } else {
    const activePage = pages[currentPath] || pages["/404"];
    mainContent.innerHTML = typeof activePage === "function" ? activePage() : activePage;
  }

  // 🎯 المزامنة المباشرة بعد رندرة الهوم تمنع عودة الزرار لحالة "تابع" عند الـ Refresh!
  updateFollowButtons();
  finishLoadingBar();
};

const navigateTo = (url) => {
  startLoadingBar();
  window.history.pushState(null, null, url);

  setTimeout(() => {
    window.scrollTo(0, 0);
    router();
  }, 500);
};

// 4️⃣ إعداد منطق محرك البحث الذكي الفوري المطور للموبايل والـ Usernames
const setupSearch = () => {
  const input = document.getElementById("search-input");
  const dropdown = document.getElementById("search-dropdown");
  const btn = document.getElementById("search-btn");
  const container = document.querySelector(".search-container");

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
        item.desc.toLowerCase().includes(value),
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

  const handleSearchButtonClick = (e) => {
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
  };

  btn.addEventListener("click", handleSearchButtonClick);

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

// 5️⃣ الاستماع العام وإدارة الضغطات بـ Event Delegation
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("popup-overlay") || document.querySelector(".popup-overlay");
  const popup = document.getElementById("follow-popup") || document.querySelector(".follow-popup");

  const closePopup = () => {
    if (overlay && popup) {
      overlay.classList.remove("show", "active", "open");
      popup.classList.remove("show", "active", "open");
      document.body.style.overflow = "";

      overlay.style.removeProperty("display");
      overlay.style.removeProperty("opacity");
      overlay.style.removeProperty("pointer-events");

      popup.style.removeProperty("display");
      popup.style.removeProperty("opacity");
      popup.style.removeProperty("visibility");
      popup.style.removeProperty("z-index");
      popup.style.removeProperty("top");
      popup.style.removeProperty("left");
      popup.style.removeProperty("transform");
    }
  };

  // 🎯 معالجة إرسال نموذج الاشتراك الفوري والتحقق المطور من البيانات
  const handleFormSubmission = () => {
    const form = document.getElementById("newsletter-form");
    const successMsg = document.getElementById("subscribe-success-msg");
    const submitBtn = document.getElementById("submit-subscribe-btn");

    if (!form) return;

    const nameInput = document.getElementById("user-name");
    const emailInput = document.getElementById("user-email");
    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");

    const validateEmailFormat = (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };

    nameInput.addEventListener("input", () => {
      const value = nameInput.value.trim();
      const hasEnglish = /[a-zA-Z]/.test(value);

      if (hasEnglish) {
        nameError.textContent = "بالعربي الله يخليك";
        nameError.classList.add("show-error");
      } else {
        nameError.classList.remove("show-error");
        nameError.textContent = "";
      }
    });

    emailInput.addEventListener("input", () => {
      const value = emailInput.value.trim();
      if (value.length > 0 && validateEmailFormat(value)) {
        emailError.classList.remove("show-error");
        emailError.textContent = "";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let isValid = true;
      const nameValue = nameInput.value.trim();
      const emailValue = emailInput.value.trim();

      if (nameValue === "") {
        nameError.textContent = "اسمك الأول يا حبيب";
        nameError.classList.add("show-error");
        isValid = false;
      } else if (/[a-zA-Z]/.test(nameValue)) {
        nameError.textContent = "بالعربي الله يخليك";
        nameError.classList.add("show-error");
        isValid = false;
      }

      if (emailValue === "") {
        emailError.textContent = "ممكن بريدك";
        emailError.classList.add("show-error");
        isValid = false;
      } else if (!validateEmailFormat(emailValue)) {
        emailError.textContent = "اكتب البريد بصيغة صحيحة";
        emailError.classList.add("show-error");
        isValid = false;
      }

      if (!isValid) return;

      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>جاري الحفظ...</span>";

      const data = new FormData(form);

      try {
        const urlEncodedData = new URLSearchParams(data).toString();

        const response = await fetch(form.action, {
          method: form.method,
          body: urlEncodedData,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const result = await response.json();

        // ❌ إذا كان البريد مسجلاً مسبقاً لا تفعل المتابعة
        if (result.result === "exists") {
          emailError.textContent = "الإيميل مسجل بالفعل";
          emailError.classList.add("show-error");
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }

        // ✅ تفعيل الاشتراك والمتابعة فقط في حالة النتيجة النجاح الحقيقية
        if (result.result === "success") {
          localStorage.setItem("isSubscribed", "true"); // توحيد حفظ الحالة
          updateFollowButtons();

          form.style.display = "none";
          if (successMsg) successMsg.style.display = "block";
          form.reset();

          window.dispatchEvent(new Event("subscriptionSuccess"));

          setTimeout(() => {
            closePopup();
            setTimeout(() => {
              form.style.display = "flex";
              if (successMsg) successMsg.style.display = "none";
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }, 400);
          }, 3500);
        } else {
          alert("عذراً، حدث خطأ أثناء حفظ البيانات.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      } catch (error) {
        alert("فشل الاتصال، يرجى التحقق من جودة الإنترنت لديك.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  };

  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".userLogo")) {
      e.preventDefault();
      navigateTo("/");
      return;
    }

    // تم دمج ونقل منطق تفعيل الفتح والغلق بالكامل للـ Event Listener المشترك لمنع تداخل الأحداث

    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      document.getElementById("search-dropdown").style.display = "none";
      navigateTo(link.getAttribute("href"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });

  setupSearch();
  handleFormSubmission();
  router(); 
});

window.addEventListener("popstate", router);