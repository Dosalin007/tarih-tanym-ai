(() => {
  const buttons = [...document.querySelectorAll('.language-switch [data-lang]')];
  const copy = [...document.querySelectorAll('[data-kk][data-ru]')];
  const titles = { kk: 'Tarih Ustaz AI · Авторлық боттар', ru: 'Tarih Ustaz AI · Авторские боты' };
  const descriptions = {
    kk: 'Tarih Ustaz AI — тарих мұғалімдеріне арналған авторлық ChatGPT көмекшілері.',
    ru: 'Tarih Ustaz AI — авторские помощники ChatGPT для учителей истории.'
  };

  function setLanguage(lang) {
    if (lang !== 'kk' && lang !== 'ru') return;
    document.documentElement.lang = lang;
    document.title = titles[lang];
    document.querySelector('meta[name="description"]').content = descriptions[lang];
    copy.forEach((node) => {
      if (node.id === 'page-title' || node.classList.contains('card-title')) {
        node.innerHTML = node.dataset[lang];
      } else {
        node.textContent = node.dataset[lang];
      }
    });
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
    try { localStorage.setItem('tarih-bots-language', lang); } catch (_) { /* Storage may be disabled. */ }
  }

  buttons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  let initial = 'kk';
  try { if (localStorage.getItem('tarih-bots-language') === 'ru') initial = 'ru'; } catch (_) { /* Use Kazakh. */ }
  setLanguage(initial);
})();
