window.addEventListener('DOMContentLoaded', function () {
  function dataLoader(text, callback) {
    var length = Math.max(Math.floor(Math.pow(Math.abs(text.split('').reduce(function (acc, curr) {
      var result = (acc << 5) - acc + curr.charCodeAt(0);
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

  function renderer(data, recycle) {
    var result = recycle;
    if (!result) {
      result = document.createElement('li');
    }
    result.innerText = data.name;
    return result;
  }

  var input = document.getElementById('input-autocomplete-input');
  var toggle = document.getElementById('input-autocomplete-toggle');
  var list = document.getElementById('input-autocomplete-list');
  var loading = document.getElementById('input-autocomplete-loading');
  var failed = document.getElementById('input-autocomplete-failed');
  var placeholder = document.getElementById('input-autocomplete-placeholder');

  list.addEventListener('click', function(e) {
    if (e.target.parentElement == list) {
      input.value = e.target.innerText;
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
