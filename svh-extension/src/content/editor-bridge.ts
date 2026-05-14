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

  getValue(): string | null {
    if (this.editor?.getValue) {
      return this.editor.getValue();
    }
    const textarea = document.querySelector('#codigo_php') as HTMLTextAreaElement;
    if (textarea) return textarea.value;
    return null;
  }

  setValue(content: string): void {
    if (this.editor?.setValue) {
      this.editor.setValue(content);
      return;
    }
    const textarea = document.querySelector('#codigo_php') as HTMLTextAreaElement;
    if (textarea) textarea.value = content;
  }

  private findEditor() {
    const iframe = document.querySelector('iframe[id^="frm_sc_code"]') as HTMLIFrameElement;
    if (!iframe || !iframe.contentWindow) return;

    try {
      const win = iframe.contentWindow as any;
      if (win.editor) {
        this.editor = win.editor;
      }
    } catch {
      // cross-origin
    }
  }
}
