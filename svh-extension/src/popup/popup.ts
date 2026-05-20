async function init() {
  // Load logo using chrome.runtime.getURL so it works in extension context
  const logoEl = document.getElementById('logo') as HTMLImageElement | null;
  if (logoEl) {
    logoEl.src = chrome.runtime.getURL('images/icon128.png');
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0]?.url || '';
    const dot = document.getElementById('dot')!;
    const text = document.getElementById('text')!;
    const badge = document.getElementById('badge')!;

    if (url.includes('/scriptcase/devel/')) {
      dot.classList.remove('off');
      text.textContent = 'Active on IDE';
      badge.textContent = 'Active';
      badge.classList.remove('inactive');
    } else {
      dot.classList.add('off');
      text.textContent = 'Not on IDE';
      badge.textContent = 'Inactive';
      badge.classList.add('inactive');
    }
  } catch {
    document.getElementById('text')!.textContent = 'Error';
  }
}

// Open Options page via button
document.getElementById('open-options')?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

init();
