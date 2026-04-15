/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ── Nav scroll style ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
});

/* ── Typing animation ── */
const phrases = [
  'fast APIs.',
  'clean UIs.',
  'scalable apps.',
  'great products.',
];
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;
const typedEl = document.getElementById('typedText');

function type() {
  const current = phrases[phraseIndex];
  if (deleting) {
    typedEl.textContent = current.slice(0, --charIndex);
  } else {
    typedEl.textContent = current.slice(0, ++charIndex);
  }

  let delay = deleting ? 60 : 100;

  if (!deleting && charIndex === current.length) {
    delay = 2000;
    deleting = true;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 400;
  }

  setTimeout(type, delay);
}
setTimeout(type, 800);

/* ── API Demo ── */
const callBtn    = document.getElementById('callBtn');
const resultBox  = document.getElementById('result');
const statusText = document.getElementById('statusText');
const resultText = document.getElementById('resultText');

callBtn.addEventListener('click', async () => {
  callBtn.disabled = true;
  callBtn.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"
         viewBox="0 0 24 24" style="animation:spin .8s linear infinite">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    Sending…`;

  resultBox.classList.add('hidden');
  resultBox.classList.remove('error');

  try {
    const res = await fetch('/hello');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    statusText.textContent = '200 OK';
    resultText.textContent = `"${text}"`;
    resultBox.classList.remove('hidden');
  } catch (err) {
    statusText.textContent = 'Error';
    resultText.textContent = err.message;
    resultBox.classList.remove('hidden');
    resultBox.classList.add('error');
  } finally {
    callBtn.disabled = false;
    callBtn.innerHTML = `
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      Send Request`;
  }
});

/* ── Inline keyframe for spinner ── */
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
