document.addEventListener("DOMContentLoaded", () => {
  const switchContainer = document.querySelector('.lang-switch-eng');
  const eng = switchContainer.querySelector('.eng');
  const jp = switchContainer.querySelector('.jp');
  
  // We use querySelectorAll here so it doesn't break if the element is missing
  const roleElements = document.querySelectorAll('.element-generalist');

  const translations = {
    en: {
      skills_title: "Skills",
      skill_archviz: "ARCHVIZ",
      skill_motion: "3D / 2D MOTION",
      skill_animator: "3D ANIMATOR",
      skill_xr: "XR / AR / VR",
      skill_vfx: "3D VFX",
      role_generalist: "3DCG\nGENERALIST",
      menu_archviz: "EVENT ARCHVIZ",
      menu_animation: "ANIMATION",
      menu_art: "CREATIVE ART"
    },
    jp: {
      skills_title: "スキル",
      skill_archviz: "建築ビジュアライズ",
      skill_motion: "3D / 2D モーション",
      skill_animator: "3D アニメーション",
      skill_xr: "XR / AR / VR",
      skill_vfx: "3D 視覚効果",
      role_generalist: "3DCG\nジェネラリスト",
      menu_archviz: "建築",
      menu_animation: "アニメーション",
      menu_art: "クリエイティブアート"
    },
  };

  function applyLanguage(lang) {
    // 1. Save the choice to the browser
    localStorage.setItem("userLanguage", lang);

    // 2. Update all standard text (the menu links you just tagged)
    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.dataset.key;
      const text = translations[lang][key];
      if (text) el.textContent = text;
    });

    // 3. Update specific "Role" elements if they exist on the page
    roleElements.forEach(el => {
      el.textContent = translations[lang].role_generalist;
      if (lang === "en") {
        el.classList.add("lang-en");
        el.classList.remove("lang-jp");
      } else {
        el.classList.add("lang-jp");
        el.classList.remove("lang-en");
      }
    });

    // 4. Update the Toggle Buttons UI
    if (lang === "en") {
      eng.classList.add("active");
      jp.classList.remove("active");
    } else {
      jp.classList.add("active");
      eng.classList.remove("active");
    }
  }

  // INITIALIZE: Check memory first, then default to English
  const savedLang = localStorage.getItem("userLanguage") || "en";
  applyLanguage(savedLang);

  // CLICK EVENTS
  eng.addEventListener("click", () => applyLanguage("en"));
  jp.addEventListener("click", () => applyLanguage("jp"));
});
