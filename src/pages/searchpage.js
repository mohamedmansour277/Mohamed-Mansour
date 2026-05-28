import { searchDatabase } from "../data/searchData.js";

// دالة ذكية لتقصير النصوص الطويلة للحفاظ على استقرار الكروت البوتيك
const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const searchpage = (query = "") => {
  if (!query)
    return `<div><h1>صفحة البحث</h1><p>برجاء كتابة كلمة للبحث عنها...</p></div>`;

  const filtered = searchDatabase.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase()),
  );

  const categories = {
    people: "الأشخاص",
    products: "المنتجات",
    tags: "الوسوم",
  };

  const getRouteType = (type) =>
    type === "people" ? "person" : type === "products" ? "product" : "tag";

  if (filtered.length === 0) {
    return `
      <div style="padding: 50px 10px; text-align: center;">
        <img src="/src/assets/icons/noresualt.svg" style="width: 220px; margin-bottom: 15px;">
        <h2>لم نجد أي نتائج لـ "${query}"</h2>
        <p>تأكد من كتابة الكلمات بشكل صحيح أو جرب كلمات أخرى.</p>
      </div>
    `;
  }

  let html = `<div class="search-page-wrapper"><h1>نتائج بحث <span style="">${query}</span> <span class="spanInside" style="">وجدنا ${filtered.length} نتيجة</span></h1>`;

  Object.keys(categories).forEach((cat) => {
    const catItems = filtered.filter((item) => item.type === cat);

    if (catItems.length > 0) {
      html += `
        <div class="searchCategoryHeader">
          <h3>${categories[cat]}</h3>
          <span>${catItems.length}</span>
        </div>
      `;

      // فتح الكونتينر الرئيسي المناسب مرة واحدة قبل الـ Loop
      if (cat === "people") {
        html += `<div class="aReaualtContainer">`;
      } else if (cat === "products") {
        html += `<div class="productsSearchList">`; // تحول إلى قائمة عمودية تحتوي على كروت أفقية
      } else {
        html += `<div class="postsSearchList">`;
      }

      catItems.forEach((item) => {
        const smartSearchRoute = item.username
          ? `/@${item.username.toLowerCase()}`
          : `/${getRouteType(item.type)}/${item.id}`;

        if (cat === "people") {
          // 👥 1. الأشخاص: الـ Grid الدائري المعتمد
          html += `
            <a href="${smartSearchRoute}" class="search-item-person" data-link>
              <img src="${item.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${item.title}">
              <h4>${item.title}</h4>
            </a>
          `;
        } else if (cat === "products") {
          // 📦 2. المنتجات: الصورة يمين والكلام شمال (مع الحفاظ على شكل الكارت الفخم)
          html += `
            <a href="${smartSearchRoute}" class="search-item-product-horizontal" data-link>
              <img src="${item.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${item.title}" class="product-horizontal-img">
              <div class="product-horizontal-info">
                <h4>${item.title}</h4>
                <p>${truncateText(item.desc, 90)}</p>
              </div>
            </a>
          `;
        } else {
          // 📰 3. الوسوم والمنشورات: الصورة يمين والكلام شمال مع بوردر سفلي وبادينج مفتوح
          html += `
            <a href="${smartSearchRoute}" class="search-item-post-horizontal" data-link>
              <img src="${item.img}" onerror="this.onerror=null; this.src='/src/assets/imgs/nopic.jpg';" alt="${item.title}" class="post-horizontal-img">
              <div class="post-horizontal-info">
                <h4>${item.title}</h4>
                <p>${truncateText(item.desc, 120)}</p>
              </div>
            </a>
          `;
        }
      });

      html += `</div>`; // قفل الكونتينر
    }
  });

  html += `</div>`;
  return html;
};