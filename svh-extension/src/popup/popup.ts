async function init() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0]?.url || '';
    const dot = document.getElementById('dot')!;
    const text = document.getElementById('text')!;

    if (url.includes('/scriptcase/devel/')) {
      dot.classList.remove('off');
      text.textContent = 'Active on IDE';
    } else {
      dot.classList.add('off');
      text.textContent = 'Not on IDE';
    }
  } catch {
    document.getElementById('text')!.textContent = 'Error';
  }
}

init();
