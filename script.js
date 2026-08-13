document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Guestbook ----------

const guestbookForm = document.getElementById('guestbook-form');
const guestbookEntries = document.getElementById('guestbook-entries');
const guestbookStatus = document.getElementById('guestbook-status');

function formatEntryDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderEntries(entries) {
  guestbookEntries.textContent = '';

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'guestbook-empty';
    empty.textContent = 'No messages yet — be the first to sign the book.';
    guestbookEntries.appendChild(empty);
    return;
  }

  entries.forEach(entry => {
    const card = document.createElement('article');
    card.className = 'guestbook-entry';

    const header = document.createElement('div');
    header.className = 'guestbook-entry-header';

    const name = document.createElement('span');
    name.className = 'guestbook-entry-name';
    name.textContent = entry.name;

    const date = document.createElement('span');
    date.className = 'guestbook-entry-date';
    date.textContent = formatEntryDate(entry.created_at);

    header.appendChild(name);
    header.appendChild(date);

    const message = document.createElement('p');
    message.className = 'guestbook-entry-message';
    message.textContent = entry.message;

    card.appendChild(header);
    card.appendChild(message);
    guestbookEntries.appendChild(card);
  });
}

async function loadGuestbook() {
  try {
    const res = await fetch('/api/guestbook');
    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();
    renderEntries(data.entries || []);
  } catch (err) {
    guestbookEntries.textContent = '';
    const errorMsg = document.createElement('p');
    errorMsg.className = 'guestbook-empty';
    errorMsg.textContent = 'Could not load messages right now — please try again shortly.';
    guestbookEntries.appendChild(errorMsg);
  }
}

if (guestbookForm) {
  loadGuestbook();

  guestbookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = guestbookForm.querySelector('button[type="submit"]');
    const formData = new FormData(guestbookForm);
    const payload = {
      name: formData.get('name'),
      message: formData.get('message'),
      website: formData.get('website')
    };

    submitBtn.disabled = true;
    guestbookStatus.textContent = 'Signing the book…';
    guestbookStatus.classList.remove('is-error');

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      guestbookForm.reset();
      guestbookStatus.textContent = 'Thank you — your message has been added.';
      loadGuestbook();
    } catch (err) {
      guestbookStatus.textContent = err.message || 'Could not save your message — please try again.';
      guestbookStatus.classList.add('is-error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}
