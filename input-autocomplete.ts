export interface InputAutocompleteOptions<T> {
  inputElement: HTMLInputElement;
  show: () => void;
  hide: () => void;
  failed: (newFailed: boolean) => void;
  loading: (newLoading: boolean) => void;
  placeholder: (showPlaceholder: boolean) => void;
  listElement: HTMLElement;
  insertBefore?: HTMLElement | null;
  dataLoader: (input: string, onLoad: (output: T[]) => void) => void;
  renderer: (content: T, element?: HTMLElement) => HTMLElement;
}

export class InputAutocomplete<T> {
  private inputElement: HTMLInputElement;
  private show: () => void;
  private hide: () => void;
  private setFailed: (newFailed: boolean) => void;
  private setLoading: (newLoading: boolean) => void;
  private setPlaceholder: (showPlaceholder: boolean) => void;
  private listElement: HTMLElement;
  private insertBefore: HTMLElement | null;
  private dataLoader: (input: string, onLoad: (output: T[]) => void) => void;
  private renderer: (content: T, element?: HTMLElement) => HTMLElement;
  private stopped: boolean;
  private changeListener: () => void;
  private focusListener: () => void;
  private blurListener: () => void;
  private loading: boolean;
  private pending: boolean;
  private data: T[];
  private elementPool: HTMLElement[];
  private showingElements: HTMLElement[];

  constructor(options: InputAutocompleteOptions<T>) {
    this.inputElement = options.inputElement;
    this.show = options.show;
    this.hide = options.hide;
    this.setFailed = options.failed;
    this.setLoading = options.loading;
    this.setPlaceholder = options.placeholder;
    this.listElement = options.listElement;
    this.insertBefore = options.insertBefore ?? null;
    this.dataLoader = options.dataLoader;
    this.renderer = options.renderer;
    this.stopped = true;
    this.changeListener = this.change.bind(this);
    this.focusListener = this.focus.bind(this);
    this.blurListener = this.blur.bind(this);
    this.loading = false;
    this.pending = false;
    this.data = [];
    this.elementPool = [];
    this.showingElements = [];
  }

  public start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.inputElement.addEventListener('keyup', this.changeListener);
    this.inputElement.addEventListener('focus', this.focusListener);
    this.inputElement.addEventListener('blur', this.blurListener);
    this.change();
    if (this.inputElement == document.activeElement) {
      this.show();
    } else {
      this.hide();
    }
  }

  public stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.inputElement.removeEventListener('keyup', this.changeListener);
    this.inputElement.removeEventListener('focus', this.focusListener);
    this.inputElement.removeEventListener('blur', this.blurListener);
    this.hide();
  }

  private change(): void {
    if (this.loading) {
      this.pending = true;
      return;
    } else {
      this.loading = true;
      this.setLoading(true);
    }
    this.dataLoader(this.inputElement.value, (data) => {
      this.loading = false;
      if (this.pending) {
        this.change();
      } else {
        this.setLoading(false);
      }
      this.pending = false;
      if (!data) {
        this.setFailed(true);
        return;
      }
      this.setFailed(false);
      this.data = data;
      this.refresh();
    });
  }

  refresh(): void {
    this.setPlaceholder(this.data.length == 0);
    while (this.showingElements[this.data.length]) {
      const element = this.showingElements.pop()!;
      this.listElement.removeChild(element);
      this.releaseElement(element);
    }
    for (let i = 0; i < this.data.length; i++) {
      if (this.showingElements[i]) {
        this.renderer(this.data[i], this.showingElements[i]);
      } else {
        this.showingElements[i] = this.acquireElement(this.data[i]);
        this.listElement.insertBefore(this.showingElements[i], this.insertBefore);
      }
    }
  }

  private focus(): void {
    this.show();
  }

  private blur(): void {
    this.hide();
  }

  private acquireElement(data: T): HTMLElement {
    return this.elementPool.length ? this.renderer(data, this.elementPool.pop()) : this.renderer(data);
  }

  private releaseElement(element: HTMLElement): void {
    this.elementPool.push(element);
  }
}
