import { InputAutocomplete } from "./input-autocomplete";

interface Item {
  name: string;
  id: number;
}

window.addEventListener('DOMContentLoaded', function () {
  function dataLoader(text: string, callback: (result: Item[]) => void) {
    const length = Math.max(Math.floor(Math.pow(Math.abs(text.split('').reduce(function (acc, curr) {
      const result = (acc << 5) - acc + curr.charCodeAt(0);
      return result & result;
    }, 0)), 0.123)) - 5, 0);
    setTimeout(function () {
      callback(Array.from(new Array(length)).map(function (_, i) {
        return {
          name: text + (i ? ' ' + (i + 1) : ''),
          id: i
        };
      }));
    }, 250);
  }

  function renderer(data: Item, recycle?: HTMLElement) {
    const result = recycle ?? document.createElement('li');
    result.innerText = data.name;
    return result;
  }

  const input = document.getElementById('input-autocomplete-input')! as HTMLInputElement;
  const toggle = document.getElementById('input-autocomplete-toggle')!;
  const list = document.getElementById('input-autocomplete-list')!;
  const loading = document.getElementById('input-autocomplete-loading')!;
  const failed = document.getElementById('input-autocomplete-failed')!;
  const placeholder = document.getElementById('input-autocomplete-placeholder')!;

  list.addEventListener('click', function(e: Event) {
    if ((e.target! as HTMLElement).parentElement == list) {
      input.value = (e.target! as HTMLElement).innerText;
    }
  });

  new InputAutocomplete({
    inputElement: input,
    listElement: list,
    show: function () { toggle.style.display = 'block'; },
    hide: function () { setTimeout(function () { toggle.style.display = ''; }, 333); },
    loading: function (b) { loading.style.display = b ? 'block' : ''; },
    failed: function (b) { failed.style.display = b ? 'block' : ''; },
    placeholder: function (b) { placeholder.style.display = b ? 'block' : ''; },
    dataLoader: dataLoader,
    renderer: renderer
  }).start();
});
