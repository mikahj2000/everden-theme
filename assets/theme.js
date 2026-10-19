// Everden theme: small, dependency-free behaviour.

// Product gallery: clicking a thumbnail shows that image.
document.querySelectorAll('[data-gallery]').forEach((gallery) => {
  const slides = gallery.querySelectorAll('[data-slide]');
  const thumbs = gallery.querySelectorAll('[data-thumb]');
  const show = (id) => {
    slides.forEach((s) => s.classList.toggle('is-active', s.dataset.slide === id));
    thumbs.forEach((t) => t.setAttribute('aria-current', String(t.dataset.thumb === id)));
  };
  thumbs.forEach((t) => t.addEventListener('click', () => show(t.dataset.thumb)));
  gallery.showMedia = show;
});

// Bundle picker: each variant is a radio card. Keep price, button and URL in sync.
document.querySelectorAll('[data-product-form]').forEach((form) => {
  const dataEl = form.querySelector('[data-variants]');
  if (!dataEl) return;
  const variants = JSON.parse(dataEl.textContent);
  const idInput = form.querySelector('input[name="id"]');
  const button = form.querySelector('[data-add-button]');
  const buttonLabel = button && button.querySelector('span');
  const priceEl = document.querySelector('[data-main-price]');
  const gallery = document.querySelector('[data-gallery]');
  const money = (cents) =>
    new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: form.dataset.currency || 'USD',
    }).format(cents / 100);

  form.querySelectorAll('input[name="bundle"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const v = variants.find((x) => String(x.id) === radio.value);
      if (!v) return;
      idInput.value = v.id;
      if (button) {
        button.disabled = !v.available;
        if (buttonLabel) buttonLabel.textContent = v.available ? button.dataset.addLabel : button.dataset.soldOutLabel;
      }
      if (priceEl) {
        let html = `<span class="price__current">${money(v.price)}</span>`;
        if (v.compare_at_price && v.compare_at_price > v.price) {
          html += `<s class="price__compare">${money(v.compare_at_price)}</s>`;
          html += `<span class="price__badge">Save ${money(v.compare_at_price - v.price).replace(/\.00(?=\D*$)/, '')}</span>`;
        }
        priceEl.innerHTML = html;
      }
      if (gallery && v.media_id && gallery.showMedia) gallery.showMedia(String(v.media_id));
      const url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      window.history.replaceState({}, '', url.toString());
    });
  });
});

// Cart page: submit when quantity changes so totals update.
document.querySelectorAll('[data-cart-qty]').forEach((input) => {
  input.addEventListener('change', () => input.form && input.form.submit());
});
