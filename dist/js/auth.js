// UI preview only: never transmit or persist account credentials.
const form = document.querySelector('#auth-form');
for (const toggle of document.querySelectorAll('.password-toggle')) {
  const input = document.getElementById(toggle.getAttribute('aria-controls'));
  input.dataset.password = 'true';
  toggle.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide' : 'Show';
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    toggle.setAttribute('aria-pressed', String(show));
  });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.querySelector('#artist-name');
  if (name && !name.value.trim()) { name.setCustomValidity('Enter your artist name.'); name.reportValidity(); return; }
  const status = document.querySelector('.auth-status');
  status.textContent = form.dataset.mode === 'forgot-password'
    ? 'Reset request previewed. No email was sent because password recovery is not connected yet.'
    : form.dataset.mode === 'signup'
      ? 'Your form is ready. Account creation is not connected yet. You can explore the demo workspace below.'
      : 'Your form is ready. Sign-in is not connected yet. You can explore the demo workspace below.';
  status.hidden = false;
  document.querySelector('.workspace-preview').hidden = form.dataset.mode === 'forgot-password';
  if (form.elements.password) form.elements.password.value = '';
  status.focus();
});
form.addEventListener('input', () => {
  form.querySelector('#artist-name')?.setCustomValidity('');
  document.querySelector('.auth-status').hidden = true;
  document.querySelector('.workspace-preview').hidden = true;
});
