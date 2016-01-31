var SYNC_KEY = '__OVERFLOW_URLS__';
var URLS;

//chrome.storage.sync.clear();

function get_target_tabs(urls, callback) {
  chrome.tabs.query({url: urls}, callback);
}

function get_duplicate_tabs(callback) {
  chrome.tabs.query({}, function(tabs) {
    if (tabs.length > 1) {
      tabs.sort(compare_tab_urls);
      var duplicates = [];
      var len = tabs.length;
      var current;
      for (var i = 1; i < len; i++) {
        current = tabs[i-1];
        if (current.url === tabs[i].url) {
          duplicates.push(current);
        }
      }
      if (callback)
        callback(duplicates);
    }
  });
}

function compare_tab_urls(a, b) {
  if (a.url < b.url) 
    return -1;
  else if (a.url > b.url)
    return 1;
  else
    return 0;
}

function close_tabs(tabs) {
  for (var i = 0; i < tabs.length; i++) {
    chrome.tabs.remove(tabs[i].id);
  }
}

function setup() {
  setup_close_button();
  setup_submit_button();
  set_default_pattern();
}

function setup_close_button() {
  // setup close button 
  $('#close-image').click(function() {
    if (URLS.length > 0)
      get_target_tabs(URLS, close_tabs);
    get_duplicate_tabs(close_tabs);
  });
}

function setup_submit_button() {
  // setup submit button
  $('#submit-button').click(function() {
    add_url($('#pattern-input').val());
  });
}

function setup_remove_buttons() {
  // setup remove buttons
  $('.remove-button').click(function(e) {
    remove_url(parseInt(e.target.name));
  });
}

function set_default_pattern() {
  // TODO: does not handle chrome:// domain correctly
  chrome.tabs.query(
      {currentWindow: true, active: true},
      function(tabs) {
        var url = tabs[0].url;
        // start search after first dot to avoid catching https://
        var search_start = url.indexOf('.');
        // get domain by removing text after forward slash
        var pattern = url.slice(0, url.indexOf('/', search_start) + 1);
        $('#pattern-input').val(pattern.concat('*'));
      });
}

function add_url(pattern) {
  //TODO: validity check
  if (URLS.length == 0 || binary_search(URLS, pattern) < 0) {
    URLS = URLS.concat(pattern).sort();
    console.log('Added', pattern);
    save_urls();
  }
  else {
    console.log('Duplicate pattern not added', pattern);
  }
}

function binary_search(arr, value) {
  var low = 0;
  var high = arr.length - 1;
  var mid;
  while (low <= high) {
    mid = Math.floor((high + low) / 2);
    item = arr[mid];
    if (item < value)
      high = mid - 1;
    else if (item > value)
      low = mid + 1;
    else
      return mid;
  }
  return -1;
}

function remove_url(index) {
  //TODO: resize popup on remove
  URLS.splice(index, 1);
  save_urls();
}

function print_urls() {
  var block = '<table>';
  for (var i = 0; i < URLS.length; i++) {
    block = block.concat('<tr><td>', URLS[i], '</td><td>',
      '<input type="button" class="remove-button" name="', i.toString(), '" value="x"></td></tr>');
  }
  block = block.concat('</table>');
  $('#domain-container').html(block);
  setup_remove_buttons();
}

function load_urls() {
  chrome.storage.sync.get({SYNC_KEY}, function(items) {
    if (items.SYNC_KEY == SYNC_KEY) {
      URLS = [];
      console.log('Creating new list');
    }
    else {
      URLS = items.SYNC_KEY;
      console.log('Loaded successfully');
    }
    print_urls();
  });
}

function save_urls() {
  chrome.storage.sync.set({SYNC_KEY: URLS}, function() {
    console.log('Saved successfully');
    print_urls();
  });
}

window.onload = function() {
  setup();
  load_urls();
};

