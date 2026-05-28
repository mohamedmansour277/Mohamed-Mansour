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
    finishLoadingBar();
    return;
  }

  // متغير لحفظ المحتوى اللي هيترندر
  let renderedHtml = null;

  // 🎯 التوجيه الذكي الموحد للمطورين، المشاريع، والوسوم باستخدام الـ Username
  if (currentPath.startsWith("/@")) {
    const username = currentPath.split("/@")[1]?.toLowerCase(); // جلب الـ username بعد الـ @
    
    // 1. فحص أولاً إذا كان الـ username يخص شخص (People)
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

    // 2. فحص ثانياً إذا كان يخص منتج/مشروع (Products)
    if (!renderedHtml) {
      const product = searchDatabase.find(
        (item) => item.type === "products" && item.username?.toLowerCase() === username
      );
      if (product) {
        renderedHtml = ProductDetailsPage(product.id);
      }
    }

    // 3. 🔥 هنا الفكرة: فحص ثالثاً إذا كان يخص وسم أو منشور (Tags)
    if (!renderedHtml) {
      const tag = searchDatabase.find(
        (item) => item.type === "tags" && item.username?.toLowerCase() === username
      );
      if (tag) {
        // بنجيب محتوى الصفحة هنا وما بنعملش return عشان نسيب الـ router يكمل تدوير للـ Navbar والـ Layout الطبيعي
        renderedHtml = TagDetailsPage(tag.id);
      }
    }

    // لو الـ username مش موجود في السيستم خالص
    if (!renderedHtml) {
      currentPath = "/404";
    }
  }

  // الحفاظ على مسار الـ id القديم للمنتجات والتاغات كـ fallback لضمان عدم حدوث كراش
  if (!renderedHtml && currentPath.startsWith("/product/")) {
    const id = currentPath.split("/")[2];
    renderedHtml = ProductDetailsPage(id);
  }

  if (!renderedHtml && currentPath.startsWith("/tag/")) {
    const id = currentPath.split("/")[2];
    renderedHtml = TagDetailsPage(id);
  }

  // 4️⃣ رندرة الصفحة النهائية مع الحفاظ الكامل على أساليب الرئيسية والـ Layout والناف بار
  if (renderedHtml) {
    mainContent.innerHTML = renderedHtml;
  } else {
    const activePage = pages[currentPath] || pages["/404"];
    mainContent.innerHTML = typeof activePage === "function" ? activePage() : activePage;
  }

  finishLoadingBar();
};

const navigateTo = (url) => {
  startLoadingBar();
  window.history.pushState(null, null, url);

  setTimeout(() => {
    // 🎯 ارفع السكرول لفوق فوراً قبل رندر الصفحة الجديدة مباشرة
    window.scrollTo(0, 0);

    router();
  }, 500); // الـ 500ms بتوع الـ Loading Bar بتوعك زي ما هما
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

  // دالة مساعدة مخصصة لإنشاء الروابط الذكية بالـ Username داخل قائمة السيرش
  const getRouteUrl = (item) => {
  // لو العنصر عنده username (سواء شخص، منتج، أو وسم منشور) يرجع الرابط الاحترافي فوراً
  if (item.username) {
    return `/@${item.username.toLowerCase()}`;
  }
  
  // الـ Fallback المضمون في حال عدم وجود username لأي سبب
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

    // ... الكود القديم لتجميع الـ Categories زي ما هو ...
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

    // 🔥 التحديث هنا: تغليف النتائج في حاوية مخصصة للسكرول، والزرار بره ثابت تحتها
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

  // 🎯 التحكم عند الضغط على أيقونة البحث
  const handleSearchButtonClick = (e) => {
    e.stopPropagation();
    const query = input.value.trim();

    // 📱 أولاً: منطق الموبايل الشاشات الصغيرة (500px أو أقل)
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

    // 💻 ثانياً: المنطق الأصلي للشاشات الكبيرة (الكمبيوتر والتابلت)
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
  const overlay = document.getElementById("popup-overlay");
  const popup = document.getElementById("follow-popup");

  const openPopup = () => {
    if (overlay && popup) {
      overlay.classList.add("show");
      popup.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  };

  // 🛠️ تحديث دالة الإغلاق لتنظيف الكلاسات والخصائص المباشرة معاً لضمان عدم التعليق
  const closePopup = () => {
    if (overlay && popup) {
      overlay.classList.remove("show", "active", "open");
      popup.classList.remove("show", "active", "open");
      document.body.style.overflow = "";

      // إزالة أي ستايلات مضافة يدوياً بـ setProperty من الملفات التانية
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

        if (result.result === "exists") {
          emailError.textContent = "الإيميل مسجل بالفعل";
          emailError.classList.add("show-error");
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          return;
        }

        if (result.result === "success") {
          form.style.display = "none";
          if (successMsg) successMsg.style.display = "block";
          form.reset();

          // 💥💥 السحر هنا: إرسال الإشارة فوراً لملف الهوم عشان يعيد جلب العداد لايف بدون ريفريش 💥💥
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

    if (e.target.closest("#follow-btn") || e.target.closest(".open-follow")) {
      openPopup();
      return;
    }

    // 🎯 صيد كليك الإغلاق بدقة باستخدام closest لمنع تداخل الـ SVGs والأيقونات المعلقة
    const isCloseBtn =
      e.target.closest("#close-popup-btn") ||
      e.target.closest(".close-popup-btn") ||
      e.target.closest(".close-btn") ||
      e.target.closest("[data-close-popup]");

    if (isCloseBtn || e.target === overlay) {
      e.preventDefault();
      e.stopPropagation(); // منع طفو الحدث للملفات الأخرى
      closePopup();
      return;
    }

    if (e.target.matches(".tab-btn")) {
      const clickedTab = e.target;
      const tabContainer = clickedTab.closest(".tabs-container");
      const tabWrapper = tabContainer.nextElementSibling;
      const targetTabId = clickedTab.dataset.tab;

      tabContainer.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.style.background = "transparent";
        btn.style.color = "#555";
        btn.classList.remove("active");
      });

      clickedTab.style.background = "var(--mainColor)";
      clickedTab.style.color = "white";
      clickedTab.classList.add("active");

      tabWrapper
        .querySelectorAll(".tab-content")
        .forEach((content) => (content.style.display = "none"));
      const targetContent = tabWrapper.querySelector(`#tab-${targetTabId}`);
      if (targetContent) targetContent.style.display = "block";
      return;
    }

    if (e.target.matches("#sort-posts-btn")) {
      import("/src/pages/home.js").then((module) => { 
        const btn = e.target;
        const currentOrder = btn.dataset.order;
        const nextOrder = currentOrder === "latest" ? "oldest" : "latest";

        btn.dataset.order = nextOrder;
        if (nextOrder === "latest") {
          btn.classList.remove("oldest-active"); // شيل لون الـ main color
          btn.innerHTML = `
    <span>الأحدث</span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
  `;
        } else {
          btn.classList.add("oldest-active"); // ضيف لون ال--mainColor
          btn.innerHTML = `
    <span>الأقدم</span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
  `;
        }
        document.getElementById("person-posts-container").innerHTML =
          module.renderPersonPosts(personId, nextOrder);
      });
      return;
    }

    if (e.target.matches(".sort-person-posts-btn")) {
      import("/src/pages/details/personDetails.js").then((module) => {
        const btn = e.target;
        const personId = btn.dataset.personId;
        const currentOrder = btn.dataset.order;
        const nextOrder = currentOrder === "latest" ? "oldest" : "latest";

        btn.dataset.order = nextOrder;
        if (nextOrder === "latest") {
          btn.classList.remove("oldest-active"); // شيل لون الـ main color
          btn.innerHTML = `
    <span>الأحدث</span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
  `;
        } else {
          btn.classList.add("oldest-active"); // ضيف لون ال--mainColor
          btn.innerHTML = `
    <span>الأقدم</span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
  `;
        }
        document.getElementById("person-posts-container").innerHTML =
          module.renderPersonPosts(personId, nextOrder);
      });
      return;
    }

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