function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days*864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
}

function showCookieBanner() {
  if (!getCookie('cookieConsent') && !sessionStorage.getItem('cookieBannerClosed')) {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
      <div style="position:fixed;bottom:0;width:100%;background:#333;color:#fff;padding:10px;z-index:9999;text-align:center">
        We use cookies to remember your form entries.
        <button id="accept-cookies" style="margin-left:10px;">Accept</button>
        <button id="close-cookie-banner" style="margin-left:10px;background:transparent;border:1px solid #fff;color:#fff;">Close</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('accept-cookies').onclick = function () {
      setCookie('cookieConsent', 'yes', 365);
      document.getElementById('cookie-banner').remove();
      enableFormPersistence();
    };

    document.getElementById('close-cookie-banner').onclick = function () {
      sessionStorage.setItem('cookieBannerClosed', 'true');
      document.getElementById('cookie-banner').remove();
    };
  } else {
    enableFormPersistence();
  }
}

function enableFormPersistence() {
  const form = document.getElementById("id-verification-form");
  if (!form) return;

  const savedData = getCookie("idVerificationData");
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      for (let [name, value] of Object.entries(data)) {
        const el = form.elements[name];
        if (el) el.value = value;
      }
    } catch (e) {
      console.warn("Error restoring form cookie", e);
    }
  }

  form.addEventListener("input", () => {
    const formData = {};
    for (let el of form.elements) {
      if (el.name) formData[el.name] = el.value;
    }
    setCookie("idVerificationData", JSON.stringify(formData), 7);
  });
}

document.addEventListener("DOMContentLoaded", showCookieBanner);