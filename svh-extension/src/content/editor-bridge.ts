export class EditorBridge {
  private editor: any = null;
  private observer: MutationObserver | null = null;

  start() {
    this.findEditor();
    this.observer = new MutationObserver(() => this.findEditor());
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  stop() {
    this.observer?.disconnect();
  }

  hasEditor(): boolean {
    return !!this.editor && typeof this.editor.getValue === 'function';
  }

  getValue(): string | null {
    if (this.editor?.getValue) {
      try {
        return this.editor.getValue();
      } catch {
        // editor may have been destroyed; fall through
      }
    }

    const localEditor = (window as any).editor;
    if (localEditor?.getValue) {
      try {
        return localEditor.getValue();
      } catch {
        // ignore
      }
    }

    const textarea = document.querySelector('#codigo_php') as HTMLTextAreaElement | null;
    if (textarea) return textarea.value;

    return null;
  }

  setValue(content: string): boolean {
    if (this.editor?.setValue) {
      try {
        this.editor.setValue(content);
        return true;
      } catch {
        // fall through
      }
    }

    const localEditor = (window as any).editor;
    if (localEditor?.setValue) {
      try {
        localEditor.setValue(content);
        return true;
      } catch {
        // fall through
      }
    }

    const textarea = document.querySelector('#codigo_php') as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.value = content;
      return true;
    }

    return false;
  }

  /**
   * Try several strategies to locate the Scriptcase code editor:
   *   1. Same-origin iframes whose id starts with one of the known prefixes
   *      (`frm_sc_code`, `id_ifr_right_`). Different Scriptcase layouts use
   *      different ids, so we probe all of them.
   *   2. Any same-origin iframe whose contentWindow exposes `window.editor`.
   *   3. The current frame itself, if `window.editor` is the editor instance.
   */
  private findEditor() {
    const knownPrefixes = ['frm_sc_code', 'id_ifr_right_'];

    for (const prefix of knownPrefixes) {
      const iframe = document.querySelector(`iframe[id^="${prefix}"]`) as HTMLIFrameElement | null;
      if (iframe && this.tryAdoptFromIframe(iframe)) return;
    }

    // Generic scan: any iframe with a same-origin window.editor.
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i] as HTMLIFrameElement;
      if (this.tryAdoptFromIframe(iframe)) return;
    }

    // This frame might itself be the code frame.
    const localEditor = (window as any).editor;
    if (localEditor && typeof localEditor.getValue === 'function') {
      this.editor = localEditor;
    }
  }

  private tryAdoptFromIframe(iframe: HTMLIFrameElement): boolean {
    if (!iframe.contentWindow) return false;
    try {
      const win = iframe.contentWindow as any;
      if (win.editor && typeof win.editor.getValue === 'function') {
        this.editor = win.editor;
        return true;
      }
    } catch {
      // cross-origin – cannot inspect this iframe.
    }
    return false;
  }
}
