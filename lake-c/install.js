(() => {
  const button = document.getElementById('installApp');
  const dialog = document.getElementById('installHelp');
  const message = document.getElementById('installHelpText');
  const displayMode = matchMedia('(display-mode: standalone)');
  let deferredPrompt = null;
  let installed = navigator.standalone === true || displayMode.matches;

  function updateButton() {
    button.hidden = installed;
  }
  function showHelp(text) {
    message.textContent = text;
    if (!dialog.open) dialog.showModal();
  }
  updateButton();
  displayMode.addEventListener('change', event => {
    installed = event.matches || navigator.standalone === true;
    updateButton();
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    updateButton();
    if (dialog.open) dialog.close();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    updateButton();
    if (dialog.open) dialog.close();
  });
  button.addEventListener('click', async () => {
    if (deferredPrompt) {
      const prompt = deferredPrompt;
      deferredPrompt = null;
      button.disabled = true;
      try {
        await prompt.prompt();
        await prompt.userChoice;
      } catch (_) {
        showHelp('Abra o menu do navegador e escolha Instalar app ou Adicionar à tela inicial.');
      } finally {
        button.disabled = false;
      }
      return;
    }
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    showHelp(ios
      ? 'No Safari, toque em Compartilhar → Adicionar à Tela de Início.'
      : 'No Chrome, toque em ⋮ → Instalar app ou Adicionar à tela inicial.');
  });
  document.getElementById('closeInstallHelp').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
})();
