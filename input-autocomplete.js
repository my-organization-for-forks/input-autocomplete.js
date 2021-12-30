var InputAutocomplete = window.InputAutocomplete = (function () {
  function result(options) {
    if (!(this instanceof result)) throw new Error('InputAutocomplete is a constructor');
    if (!options) throw new Error('InputAutocomplete requires options to be provided');
    this.inputElement = options.inputElement;
    this.show = options.show;
    this.hide = options.hide;
    this.setFailed = options.failed;
    this.setLoading = options.loading;
    this.setPlaceholder = options.placeholder;
    this.listElement = options.listElement;
    this.insertBefore = options.insertBefore || null;
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

  Object.defineProperties(result.prototype, {
    start: {
      value: function () {
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
    },
    stop: {
      value: function () {
        if (this.stopped) return;
        this.stopped = true;
        this.inputElement.removeEventListener('keyup', this.changeListener);
        this.inputElement.removeEventListener('focus', this.focusListener);
        this.inputElement.removeEventListener('blur', this.blurListener);
        this.hide();
      }
    },
    change: {
      value: function () {
        if (this.loading) {
          this.pending = true;
          return;
        } else {
          this.loading = true;
          this.setLoading(true);
        }
        var self = this;
        this.dataLoader(this.inputElement.value, function (data) {
          self.loading = false;
          if (self.pending) {
            self.change();
          } else {
            self.setLoading(false);
          }
          self.pending = false;
          if (!data) {
            self.setFailed(true);
            return;
          }
          self.setFailed(false);
          self.data = data;
          self.refresh();
        });
      }
    },
    refresh: {
      value: function () {
        this.setPlaceholder(this.data.length == 0);
        while (this.showingElements[this.data.length]) {
          var element = this.showingElements.pop();
          this.listElement.removeChild(element);
          this.releaseElement(element);
        }
        for (var i = 0; i < this.data.length; i++) {
          if (this.showingElements[i]) {
            this.renderer(this.data[i], this.showingElements[i]);
          } else {
            this.showingElements[i] = this.acquireElement(this.data[i]);
            this.listElement.insertBefore(this.showingElements[i], this.insertBefore);
          }
        }
      }
    },
    focus: {
      value: function () {
        this.show();
      }
    },
    blur: {
      value: function () {
        this.hide();
      }
    },
    acquireElement: {
      value: function (data) {
        return this.elementPool.length ? this.renderer(data, this.elementPool.pop()) : this.renderer(data);
      }
    },
    releaseElement: {
      value: function (element) {
        this.elementPool.push(element);
      }
    }
  });

  return result;
})();
