// lang-switch.js
document.addEventListener("DOMContentLoaded", () => {
  const switchContainer = document.querySelector('.lang-switch-eng');
  const eng = switchContainer.querySelector('.eng');
  const jp = switchContainer.querySelector('.jp');
  const roleElement = document.querySelector('.element-generalist');

  // ----------------------------------
  // 1) TEXT DICTIONARY
  // ----------------------------------
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
      skill_vfx: "3D VFX",
      role_generalist: "3DCG\nジェネラリスト",
      menu_archviz: "建築",
      menu_animation: "アニメーション",
      menu_art: "クリエイティブアート"
    },
  };

  // ----------------------------------
  // 2) FUNCTION TO APPLY LANGUAGE
  // ----------------------------------
  function applyLanguage(lang) {
    // Update all elements with data-key
    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.dataset.key;
      const text = translations[lang][key];
      if (!text) return;
      el.textContent = text;
    });

    // Update role element text + font/size
    roleElement.textContent = translations[lang].role_generalist;
    if (lang === "en") {
      roleElement.classList.add("lang-en");
      roleElement.classList.remove("lang-jp");
    } else {
      roleElement.classList.add("lang-jp");
      roleElement.classList.remove("lang-en");
    }
  }

  // ----------------------------------
  // 3) INITIALIZE DEFAULT LANGUAGE
  // ----------------------------------
  applyLanguage("en");
  eng.classList.add("active");

  // ----------------------------------
  // 4) SWITCH HANDLERS
  // ----------------------------------
  eng.addEventListener("click", () => {
    eng.classList.add("active");
    jp.classList.remove("active");
    applyLanguage("en");
  });

  jp.addEventListener("click", () => {
    jp.classList.add("active");
    eng.classList.remove("active");
    applyLanguage("jp");
  });
});
