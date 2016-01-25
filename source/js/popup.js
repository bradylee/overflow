var SYNC_KEY = 'urls';
var DOMAINS;
//var DOMAINS = ['https://www.google.com/*', 'http://stackoverflow.com/*'];

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
  //TODO: prevent duplicates
  DOMAINS = DOMAINS.concat(pattern);
  console.log('added');
  console.log(DOMAINS);
  save_domains();
}

function remove_domain(index) {
  //TODO: resize popup on remove
  console.log(index);
  DOMAINS.splice(index, 1);
  save_domains();
}

function print_domains() {
  var block = '<table>';
  for (var i = 0; i < DOMAINS.length; i++) {
    console.log(DOMAINS.length);
    block = block.concat('<tr><td>', DOMAINS[i], '</td><td>',
      '<input type="button" class="remove-button" name="', i.toString(), '" value="x"></td></tr>');
  }
  block = block.concat('</table>');
  //var block = '<table><tbody>' DOMAINS.join('\n');
  console.log(block);
  $('#domain-container').html(block);
  setup_remove_buttons();
}

function load_domains() {
  chrome.storage.sync.get({SYNC_KEY}, function(items) {
    console.log(items);
    if (items.SYNC_KEY == SYNC_KEY) {
      DOMAINS = [];
    }
    else {
      DOMAINS = items.SYNC_KEY;
    }
    console.log(DOMAINS);
    print_domains();
  });
}

function save_domains() {
  chrome.storage.sync.set({SYNC_KEY: DOMAINS}, function() {
    console.log('Saved successfully');
    console.log(DOMAINS);
    print_domains();
  });
}

window.onload = function() {
  setup();
  load_domains();
  //chrome.storage.sync.clear(function() {console.log('cleared')});
};

