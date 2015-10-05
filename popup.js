//var urls = ['https://www.google.com/', 'https://www.yahoo.com/'];
var states = {};
var storageLocation = chrome.storage.local;

var STATE_STORAGE = 'state';
var STATE_PREFIX = 'state_'; // use prefix to avoid potential naming conflict with program-saved values

function closeTabs(tabs) {
    for (var i = 0; i < tabs.length; i++) {
        chrome.tabs.remove(tabs[i].id);
    }
}

function saveState(state) {
    chrome.tabs.query(
            {},
            function(tabs) {
                urls = [];
                for (var i = 0; i < tabs.length; i++) {
                    url = tabs[i].url;
                    console.log(url);
                    urls.push(url);
                }
                var name = STATE_PREFIX + state;
                storageLocation.set(
                        {name: urls},
                        function() {
                            console.log('saved');
                            addStateItem(state);
                            /*
                               storageLocation.get(
                               {name},
                               function(items) {
                               console.log(items);
                               console.log(items.name);
                               }); */
                        });
            });
}

function loadState(state) {
    chrome.tabs.query(
            {},
            function(tabs) {
                // load new tabs
                var name = STATE_PREFIX + state;
                storageLocation.get(
                        {name},
                        function (items) {
                            console.log(items, items.name)
                                urls = items.name;
                            // open saved tabs
                            for (var i = 0; i < urls.length; i++) {
                                //console.log(urls[i]);
                                chrome.tabs.create({url: urls[i]});
                            }
                            closeTabs(tabs);
                        });
            });
}

function addStateItem(state) {
    if (!states.hasOwnProperty(state)) {
        states[state] = null;
        displayStateItem(state);
        storageLocation.set({STATE_STORAGE: states});
    }
}

function displayStateItem(state) {
    a = document.createElement('a');
    text = document.createTextNode(state);
    a.appendChild(text);
    a.href = "#";
    a.id = state;
    a.addEventListener("click", function() { loadState(state) });
    document.body.appendChild(a);
    document.body.appendChild(document.createElement('br'));
}

function init() {
    document.getElementById('clean').addEventListener("click", function() {
    });

    document.getElementById('save').addEventListener("click", function() {
        saveState('what')
    });

    storageLocation.get(
            {STATE_STORAGE}, 
            function(items) {
                console.log(items, items.STATE_STORAGE);
                if (items.STATE_STORAGE !== STATE_STORAGE) {
                    states = items.STATE_STORAGE;
                    console.log('states loaded', states);
                    for (var state in states) {
                        if (states.hasOwnProperty(state))
                            displayStateItem(state);
                    }
                }
            });
}

/*
   chrome.storage.onChanged.addListener(function(changes, namespace) {
   for (key in changes) {
   var storageChange = changes[key];
   console.log(key, namespace, storageChange.oldValue, storageChange.newValue);
   }
   });
   */

init();

/*
storageLocation.clear(function() {
    console.log('deleted');
    init();
});
*/

//init();


/*
   document.getElementById('load').addEventListener("click", function() {
   chrome.tabs.query(
   {},
   function(tabs) {
   closeTabs(tabs);
   loadTabs('test');
   });
   });
   */



// chrome.runtime.getBackgroundPage(function(background) { background.saveUrls(urls); });

