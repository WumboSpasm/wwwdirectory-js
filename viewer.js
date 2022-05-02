/*--------------------+
 | Retrieve JSON data |
 +--------------------*/
let listRequest = new XMLHttpRequest();
listRequest.open('GET', 'list.json');
listRequest.responseType = 'json';
listRequest.onload = function() {updatePage(this.response)};
listRequest.send();

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
    
    /*--------------------------+
     | Insert data into sidebar |
     +--------------------------*/
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
    
    /*----------------+
     | Load page data |
     +----------------*/
    let pageRequest = new XMLHttpRequest();
    pageRequest.open('GET', 'hypertext/' + targetID + '.htm');
    pageRequest.responseType = 'text';
    pageRequest.send();
    
    pageRequest.onload = function() {
        /*-------------------+
         | Handle checkboxes |
         +-------------------*/
        // Emphasize local links
        document.querySelector('#localLinks').addEventListener('click', () => {
            document.querySelectorAll('div#page a[local="false"]').forEach(pageLink => {
                pageLink.style.opacity = document.querySelector('#localLinks').checked ? '0.2' : '1';
            });
        });
        
        // Markup view
        function toggleMarkupView() {
            document.querySelector('div#page').hidden ^= true;
            document.querySelector('pre#page').hidden ^= true;
        }
        
        document.querySelector('#markupView').addEventListener('click', toggleMarkupView);
        
        /*----------------------+
         | Handle embedded page |
         +----------------------*/
        let pageMarkup = this.response;
        document.querySelector('pre#page').textContent = pageMarkup;
        
        // Fix bad formatting that can hide large portions of a page in modern browsers
        let lessThan = pageMarkup.indexOf('<');
        
        while (lessThan != -1) {
            let commentStart = pageMarkup.indexOf('<!--', lessThan),
                commentEnd = pageMarkup.indexOf('-->', commentStart),
                greaterThan = pageMarkup.indexOf('>', lessThan);
            
            // Check for and fix comments without ending double hyphen
            if (lessThan == commentStart && commentStart != -1 && commentEnd != greaterThan - 2)
                pageMarkup = pageMarkup.substring(0, greaterThan) + '--' + pageMarkup.substring(greaterThan, pageMarkup.length);
            // Check for and fix HTML attributes without ending quotation mark
            else {
                let innerElement = pageMarkup.substring(lessThan + 1, greaterThan),
                    attributeStart = innerElement.lastIndexOf('="');
                
                if (attributeStart != -1 && innerElement.indexOf('"', attributeStart + 2) == -1)
                    pageMarkup = pageMarkup.substring(0, greaterThan) + '"' + pageMarkup.substring(greaterThan, pageMarkup.length);
            }
            
            lessThan = pageMarkup.indexOf('<', lessThan + 1);
        }
        
        let pageDocument = new DOMParser().parseFromString(pageMarkup, 'text/html');
        
        // Assume plaintext and enable markup view if page has no tags
        if (pageDocument.querySelectorAll('*').length <= 3) {
            document.querySelector('#markupView').checked = true;
            toggleMarkupView();
            // We don't need to make changes to HTML elements that don't exist
            document.querySelector('div#page').innerHTML = pageDocument.documentElement.innerHTML;
            return;
        }
        
        // Apply page title to parent
        if (pageDocument.querySelector('title'))
            document.title = pageDocument.querySelector('title').textContent + ' | ' + document.title;
        else
            document.title = list[targetID].url + ' | ' + document.title;
        
        // Remove the only image-loading attribute I know of
        if (pageDocument.body.hasAttribute('background'))
            pageDocument.body.removeAttribute('background');
        
        // Replicate functionality of a rare non-standard attribute meant to change the background color
        if (pageDocument.body.hasAttribute('rgb'))
            pageDocument.body.style.backgroundColor = pageDocument.body.getAttribute('rgb');
        
        // Disable all HTML forms
        if (pageDocument.querySelector('form')) {
            let pageForm = pageDocument.querySelectorAll('form');
            
            for (let i = 0; i < pageForm.length; i++)
                pageForm[i].replaceWith(...pageForm[i].childNodes);
        }
        
        // Insert placeholder for <isindex>
        if (pageDocument.querySelector('isindex')) {
            let index = document.createElement('form'),
                topDivider = document.createElement('hr');
            
            index.setAttribute('onsubmit', 'return false');
            index.appendChild(topDivider);
            
            if (pageDocument.querySelector('isindex').hasAttribute('prompt'))
                index.insertAdjacentText('beforeend', pageDocument.querySelector('isindex').getAttribute('prompt'));
            else
                index.insertAdjacentText('beforeend', 'This is a searchable index. Enter search keywords: ');
            
            index.appendChild(document.createElement('input'));
            index.appendChild(document.createElement('hr'));
            
            pageDocument.querySelector('isindex').insertAdjacentElement('afterbegin', index);
        }
        
        // Remove all <img> elements, replace with alt text
        pageDocument.querySelectorAll('img').forEach(pageImage => {
            if (pageImage.alt)
                pageImage.insertAdjacentText('afterend', pageImage.alt);
            else if (pageImage.src && pageImage.src.length > 1)
                pageImage.insertAdjacentText('afterend', ' ' + pageImage.src.substring(pageImage.src.lastIndexOf("/") + 1) + ' ');
            
            pageImage.remove();
        });
        
        // Fix <marquee> instances using a very old and unsupported format
        pageDocument.querySelectorAll('marquee').forEach(oldMarquee => {
            let newMarquee = document.createElement('marquee');
            newMarquee.textContent = oldMarquee.getAttribute('text');
            
            oldMarquee.replaceWith(newMarquee, ...oldMarquee.childNodes);
        });
        
        // Remove unneeded HTML tags/elements
        let unneededElements = [ 'head', 'header', 'link' ],
            unneededTags = [ 'title', 'base' ];
        
        pageDocument.querySelectorAll('*').forEach(node => {
            if (unneededElements.includes(node.nodeName.toLowerCase()))
                node.replaceWith(...node.childNodes);
            else if (unneededTags.includes(node.nodeName.toLowerCase()))
                node.remove();
        });
        
        // Apply modified HTML to div
        document.querySelector('div#page').innerHTML = pageDocument.documentElement.innerHTML;
        
        // Redirect links to archival sites
        document.querySelectorAll('div#page a[href]').forEach((pageLink) => {
            setTimeout(() => {
                // Make sure link isn't an anchor
                if (!pageLink.getAttribute('href').startsWith('#')) {
                    pageLink.setAttribute('local', 'false');
                    pageLink.setAttribute('target', '_blank');
                    
                    // Check if destination exists within the archive
                    if (list.findIndex(obj => obj.url === pageLink.href) != -1) {
                        pageLink.setAttribute('local', 'true');
                        pageLink.setAttribute('target', '_parent');
                        
                        pageLink.href = window.location.pathname + '?url=' + pageLink.href;
                        
                        if (document.querySelector('#localLinks').disabled)
                            document.querySelector('#localLinks').disabled = false;
                    } else if (pageLink.href.includes('http://')) {
                        let currentDomain = new URL(list[targetID].url).origin,
                            linkDomain = new URL(pageLink.href).host;
                        
                        if (pageLink.getAttribute('href').startsWith('/'))
                            pageLink.href = 'https://web.archive.org/web/0/' + currentDomain + pageLink.getAttribute('href');
                        else if (linkDomain == window.location.hostname) {
                            if (pageLink.href[-1] == '/')
                                pageLink.href = 'https://web.archive.org/web/0/' + list[targetID].url + '/' + pageLink.getAttribute('href');
                            else
                                pageLink.href = 'https://web.archive.org/web/0/' + list[targetID].url.substring(0, list[targetID].url.lastIndexOf('/') + 1) + pageLink.getAttribute('href');
                        } else
                            pageLink.href = 'https://web.archive.org/web/0/' + pageLink.href;
                        
                        if (document.querySelector('#localLinks').checked)
                            pageLink.style.opacity = '0.2';
                    }
                }
            }, 1);
        });
    };
}