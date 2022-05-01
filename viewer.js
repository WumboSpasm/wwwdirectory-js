/*--------------------+
 | Retrieve JSON data |
 +--------------------*/
let request = new XMLHttpRequest();
request.open('GET', 'list.json');
request.responseType = 'json';
request.onload = function() {updatePage(this.response)};
request.send();

function updatePage(list) {
    /*------------------+
     | Get query string |
     +------------------*/
    let query = new URLSearchParams(location.search);
    // Get index of specified URL in list (reflective of filenames)
    let targetID = list.findIndex(obj => obj.url === query.get('url'));
    // Redirect to homepage if URL doesn't exist in list
    if (targetID < 1) {
        alert('Invalid URL!');
        window.location.replace('index.html');
        return;
    }
    
    /*-----------------------+
     | Insert data into page |
     +-----------------------*/
    // Change iframe URL and sidebar image to that of specified page
    document.querySelector('iframe').contentWindow.location.replace('hypertext/' + targetID + '.htm');
    document.querySelector('#pageInfo img').src = 'image/' + targetID + '.png';
    document.querySelector('#imageExpand img').src = 'image/' + targetID + '.png';
    // URL text
    document.querySelector('#pageURL b').textContent = list[targetID].url;
    // [Search domain]
    document.querySelector('#pageURL a').href = 'results.html?domain=' + list[targetID].url.substr(7, list[targetID].url.indexOf('/', 7) - 7);
    // [View on Wayback Machine]
    document.querySelectorAll('#pageLinks a')[0].href = 'https://web.archive.org/web/0/' + list[targetID].url;
    // [View live URL]
    document.querySelectorAll('#pageLinks a')[1].href = list[targetID].url;
    // [View raw HTML]
    document.querySelectorAll('#pageLinks a')[2].href = 'hypertext/' + targetID + '.htm';
    // Category
    document.querySelector('#pageCategory a').textContent = list[targetID].category;
    document.querySelector('#pageCategory a').href = 'results.html?category=' + list[targetID].category;
    // Keywords
    for (let i = 0; i < list[targetID].keyword.length; i++) {
        let keywordLink = document.createElement('a');
        keywordLink.textContent = list[targetID].keyword[i];
        keywordLink.href = 'results.html?keyword=' + list[targetID].keyword[i].replaceAll('&', '%26');
        
        document.querySelector('#pageKeywords').insertAdjacentElement('beforeend', keywordLink);
        
        if (i != list[targetID].keyword.length - 1)
            document.querySelector('#pageKeywords').insertAdjacentText('beforeend', ', ');
    }
    // Previous URL
    document.querySelectorAll('#pageNavigation a')[0].href = window.location.pathname + '?url=' + list[(targetID - 1) ? (targetID - 1) : (list.length - 1)].url.replaceAll('#', '%23').replaceAll('&', '%26');
    // Random URL
    document.querySelectorAll('#pageNavigation a')[1].href = window.location.pathname + '?url=' + list[Math.floor(Math.random() * 8046) + 1].url.replaceAll('#', '%23').replaceAll('&', '%26');
    // Next URL
    document.querySelectorAll('#pageNavigation a')[2].href = window.location.pathname + '?url=' + list[(targetID + 1 == list.length) ? 1 : targetID + 1].url.replaceAll('#', '%23').replaceAll('&', '%26');
    
    // Make image expand upon click
    document.querySelectorAll('img').forEach(pageImage => {
        pageImage.addEventListener('click', () => {document.querySelector('#imageExpand').hidden ^= true;})
    });
    
    /*--------------------+
     | Coolify the iframe |
     +--------------------*/
    let pageFrame = document.querySelector('iframe'),
        frameMarkup,
        frameMarkupRaw;
    
    // "Highlight local links" checkbox handler
    document.querySelector('#localLinks').addEventListener('click', () => {
        pageFrame.contentDocument.querySelectorAll('a[local="false"]').forEach(frameLink => {
            frameLink.style.opacity = document.querySelector('#localLinks').checked ? '0.2' : '1';
        });
    });
    
    // "Markup view" checkbox handler
    function toggleMarkupView() {
        pageFrame.contentDocument.body.hidden ^= true;
        
        if (!document.querySelector('#markupView').checked)
            pageFrame.contentDocument.querySelector('html > pre').remove();
        else {
            let textContainer = pageFrame.contentDocument.createElement('pre');
            textContainer.style.whiteSpace = 'pre-wrap';
            textContainer.style.margin = '8px';
            textContainer.textContent = frameMarkupRaw;
            
            pageFrame.contentDocument.body.insertAdjacentElement('beforebegin', textContainer);
        }
    }
    document.querySelector('#markupView').addEventListener('click', toggleMarkupView);
    
    // This is literally the only way to check the readyState of an iframe
    let frameHandler = setInterval(() => {
        if (pageFrame.contentDocument.readyState === 'interactive') {
            // Prevent page from loading resources that probably don't exist 25+ years later
            pageFrame.contentWindow.stop();
            
            // Get un-coolified markup of iframe
            frameMarkup = pageFrame.contentDocument.documentElement.innerHTML;
            
            // Remove auto-generated tags in markup view
            if (frameMarkup.startsWith('<head></head><body>') && frameMarkup.endsWith('</body>')) {
                frameMarkupRaw = frameMarkup.substr(19, frameMarkup.length - 26);
                
                // Assume plaintext and enable markup view if page has no tags
                if (pageFrame.contentDocument.querySelectorAll('*').length <= 3) {
                    document.querySelector('#markupView').checked = true;
                    toggleMarkupView();
                    // We don't need to perform operations on code that doesn't exist
                    return;
                }
            }
            else
                frameMarkupRaw = frameMarkup;
            
            // Fix bad formatting that can hide large portions of a page in modern browsers
            let lessThan = frameMarkup.indexOf('<');
            
            while (lessThan != -1) {
                let commentStart = frameMarkup.indexOf('<!--', lessThan),
                    commentEnd = frameMarkup.indexOf('-->', commentStart),
                    greaterThan = frameMarkup.indexOf('>', lessThan);
                
                // Check for and fix comments without ending double hyphen
                if (lessThan == commentStart && commentStart != -1 && commentEnd != greaterThan - 2) {
                    let commentStartNext = frameMarkup.indexOf('<!--', commentStart + 1);
                    
                    if (commentStartNext > commentEnd || commentStartNext == -1)
                        frameMarkup = frameMarkup.substring(0, commentEnd) + frameMarkup.substring(commentEnd + 3, frameMarkup.length);
                    
                    frameMarkup = frameMarkup.substring(0, greaterThan) + '--' + frameMarkup.substring(greaterThan, frameMarkup.length);
                }
                // Check for and fix HTML attributes without ending quotation mark
                else {
                    let innerElement = frameMarkup.substring(lessThan + 1, greaterThan),
                        attributeStart = innerElement.lastIndexOf('="');
                    
                    if (attributeStart != -1 && innerElement.indexOf('"', attributeStart + 2) == -1)
                        frameMarkup = frameMarkup.substring(0, greaterThan) + '"' + frameMarkup.substring(greaterThan, frameMarkup.length);
                }
                
                lessThan = frameMarkup.indexOf('<', lessThan + 1);
            }
            
            pageFrame.contentDocument.documentElement.innerHTML = frameMarkup;
            
            // Apply framed page title to parent
            if (pageFrame.contentDocument.querySelector('title'))
                document.title = pageFrame.contentDocument.querySelector('title').textContent + ' | ' + document.title;
            else
                document.title = list[targetID].url + ' | ' + document.title;
            
            // Remove the only image-loading attribute I know of
            if (pageFrame.contentDocument.body.hasAttribute('background'))
                pageFrame.contentDocument.body.removeAttribute('background');
            
            // Replicate functionality of a rare non-standard attribute meant to change the background color
            if (pageFrame.contentDocument.body.hasAttribute('rgb'))
                pageFrame.contentDocument.body.style.backgroundColor = pageFrame.contentDocument.body.getAttribute('rgb');
            
            // Disable all HTML forms
            if (pageFrame.contentDocument.querySelector('form')) {
                let frameForm = pageFrame.contentDocument.querySelectorAll('form');
                
                for (let i = 0; i < frameForm.length; i++)
                    frameForm[i].replaceWith(...frameForm[i].childNodes);
            }
            
            // Insert placeholder for <isindex>
            if (pageFrame.contentDocument.querySelector('isindex')) {
                let index = document.createElement('form'),
                    topDivider = document.createElement('hr');
                
                index.setAttribute('onsubmit', 'return false');
                index.appendChild(topDivider);
                
                if (pageFrame.contentDocument.querySelector('isindex').hasAttribute('prompt'))
                    index.insertAdjacentText('beforeend', pageFrame.contentDocument.querySelector('isindex').getAttribute('prompt'));
                else
                    index.insertAdjacentText('beforeend', 'This is a searchable index. Enter search keywords: ');
                
                index.appendChild(document.createElement('input'));
                index.appendChild(document.createElement('hr'));
                
                pageFrame.contentDocument.querySelector('isindex').insertAdjacentElement('afterbegin', index);
            }
            
            // Grey out links that haven't been updated yet
            let pageStyle = document.createElement('style');
            pageStyle.textContent = 'a[href]:not([href^="#"]):not([local]) {filter: grayscale(1) opacity(0.5)}';
            
            pageFrame.contentDocument.documentElement.insertAdjacentElement('afterbegin', pageStyle);
            
            // Remove all <img> elements, replace with alt text
            pageFrame.contentDocument.querySelectorAll('img').forEach(frameImage => {
                if (frameImage.alt)
                    frameImage.insertAdjacentText('afterend', frameImage.alt);
                else if (frameImage.src && frameImage.src.length > 1)
                    frameImage.insertAdjacentText('afterend', ' ' + frameImage.src.substring(frameImage.src.lastIndexOf("/") + 1) + ' ');
                
                frameImage.remove();
            });
            
            // Prevent <base> from screwing with page links
            if (pageFrame.contentDocument.querySelector('base'))
                pageFrame.contentDocument.querySelector('base').remove();
            
            // Redirect links to archival sites
            pageFrame.contentDocument.querySelectorAll('a[href]').forEach((frameLink, i) => {
                setTimeout(() => {
                    // Make sure link isn't an anchor
                    if (!frameLink.getAttribute('href').startsWith('#')) {
                        frameLink.setAttribute('local', 'false');
                        frameLink.setAttribute('target', '_blank');
                        
                        // Check if destination exists within the archive
                        if (list.findIndex(obj => obj.url === frameLink.href) != -1) {
                            frameLink.setAttribute('local', 'true');
                            frameLink.setAttribute('target', '_parent');
                            
                            frameLink.href = window.location.pathname + '?url=' + frameLink.href;
                            
                            if (document.querySelector('#localLinks').disabled)
                                document.querySelector('#localLinks').disabled = false;
                        } else if (frameLink.href.includes('http://')) {
                            let currentDomain = new URL(list[targetID].url).origin,
                                linkDomain = new URL(frameLink.href).host;
                            
                            if (frameLink.getAttribute('href').startsWith('/'))
                                frameLink.href = 'https://web.archive.org/web/0/' + currentDomain + frameLink.getAttribute('href');
                            else if (linkDomain == window.location.hostname) {
                                if (frameLink.href[-1] == '/')
                                    frameLink.href = 'https://web.archive.org/web/0/' + list[targetID].url + '/' + frameLink.getAttribute('href');
                                else
                                    frameLink.href = 'https://web.archive.org/web/0/' + list[targetID].url.substring(0, list[targetID].url.lastIndexOf('/') + 1) + frameLink.getAttribute('href');
                            } else
                                frameLink.href = 'https://web.archive.org/web/0/' + frameLink.href;
                            
                            if (document.querySelector('#localLinks').checked)
                                frameLink.style.opacity = '0.2';
                        }
                    }
                }, i);
            });
            
            clearInterval(frameHandler);
        }
    }, 1);
}