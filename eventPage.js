function run(f) {
    f();
}

function openUrls(urls) {
    for (var i = 0; i < urls.length; i++) {
        var url = urls[i];
        console.log(url);
        chrome.tabs.create({'url': url});
    }
}

function queryUrls(urls) {
    chrome.tabs.query(
            {url: ['https://www.google.com/', 'https://www.yahoo.com/']},
            function(tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    console.log(tabs[i].url, tabs[i].id);
                    chrome.tabs.remove(tabs[i].id);
                }
            });
}        

function saveUrls(urls) {
    chrome.storage.sync.set(
            {'urls': urls},
            function () {
                console.log('saved');
            });
}

function loadUrls(urls) {
    chrome.storage.sync.get(
            'urls',
            function (items) {
                console.log('loaded');
                queryUrls(items.urls);
            });
}

