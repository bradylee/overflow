var SYNC_KEY = '__OVERFLOW_DOMAINS__';
var DOMAINS;

//chrome.storage.sync.clear();

function get_target_tabs(urls, callback) {
  chrome.tabs.query({url: urls}, callback);
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
    get_target_tabs(DOMAINS, close_tabs);
  });
}

function setup_submit_button() {
  // setup submit button
  $('#submit-button').click(function() {
    add_domain($('#pattern-input').val());
  });
}

function setup_remove_buttons() {
  // setup remove buttons
  $('.remove-button').click(function(e) {
    remove_domain(parseInt(e.target.name));
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

function add_domain(pattern) {
  //TODO: validity check
  if (DOMAINS.length == 0 || binary_search(DOMAINS, pattern) < 0) {
    DOMAINS = DOMAINS.concat(pattern).sort();
    console.log('Added', pattern);
    save_domains();
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
    if (item === value)
      return mid;
    else if (item > value)
      low = mid + 1;
    else
      high = mid - 1;
  }
  return -1;
}

function remove_domain(index) {
  //TODO: resize popup on remove
  DOMAINS.splice(index, 1);
  save_domains();
}

function print_domains() {
  var block = '<table>';
  for (var i = 0; i < DOMAINS.length; i++) {
    block = block.concat('<tr><td>', DOMAINS[i], '</td><td>',
      '<input type="button" class="remove-button" name="', i.toString(), '" value="x"></td></tr>');
  }
  block = block.concat('</table>');
  $('#domain-container').html(block);
  setup_remove_buttons();
}

function load_domains() {
  chrome.storage.sync.get({SYNC_KEY}, function(items) {
    if (items.SYNC_KEY == SYNC_KEY) {
      DOMAINS = [];
      console.log('Creating new list');
    }
    else {
      DOMAINS = items.SYNC_KEY;
      //DOMAINS = JSON.parse(items.SYNC_KEY);
      console.log('Loaded successfully');
    }
    print_domains();
  });
}

function save_domains() {
  chrome.storage.sync.set({SYNC_KEY: DOMAINS}, function() {
  //chrome.storage.sync.set({SYNC_KEY: JSON.stringify(DOMAINS)}, function() {
    console.log('Saved successfully');
    print_domains();
  });
}

window.onload = function() {
  setup();
  load_domains();
  //chrome.storage.sync.clear(function() {console.log('cleared')});
};

