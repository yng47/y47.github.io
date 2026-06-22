document.addEventListener("DOMContentLoaded", () => {
  const switchContainer = document.querySelector('.lang-switch-eng');
  
  // Safety check: if the switcher isn't on this page, we only need to apply the saved language
  const eng = switchContainer ? switchContainer.querySelector('.eng') : null;
  const jp = switchContainer ? switchContainer.querySelector('.jp') : null;
  
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
      menu_art: "CREATIVE ART",
      menu_ai: "AI ART"
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
      menu_art: "クリエイティブアート",
      menu_ai: "AIアート"
    },
  };

  function applyLanguage(lang) {
    // 1. Save the choice to the browser
    localStorage.setItem("userLanguage", lang);

    // 2. Update all text + apply CSS classes for rotation/styling
    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.dataset.key;
      const text = translations[lang][key];
      if (text) el.textContent = text;

      // Apply classes to trigger your CSS transform: rotate(0deg)
      if (lang === "jp") {
        el.classList.add("lang-jp");
        el.classList.remove("lang-en");
      } else {
        el.classList.add("lang-en");
        el.classList.remove("lang-jp");
      }
    });

    // 3. Update "Role" elements specifically if they exist
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

    // 4. Update the Toggle Buttons UI (only if they exist on this page)
    if (eng && jp) {
      if (lang === "en") {
        eng.classList.add("active");
        jp.classList.remove("active");
      } else {
        jp.classList.add("active");
        eng.classList.remove("active");
      }
    }
  }

  // INITIALIZE: Check memory first, then default to English
  const savedLang = localStorage.getItem("userLanguage") || "en";
  applyLanguage(savedLang);

  // CLICK EVENTS (with safety checks)
  if (eng) {
    eng.addEventListener("click", () => applyLanguage("en"));
  }
  if (jp) {
    jp.addEventListener("click", () => applyLanguage("jp"));
  }
});
