/*--------------------+
 | Retrieve JSON data |
 +--------------------*/
let request = new XMLHttpRequest();
request.open('GET', 'metadata.json');
request.responseType = 'json';
request.onload = function() {updatePage(this.response)};
request.send();

function updatePage(page) {
    /*------------------+
     | Get query string |
     +------------------*/
    let query = new URLSearchParams(location.search);
    let targetID = page.findIndex(obj => obj.url === query.get('url'));
    if (targetID < 1) {
        alert('Invalid URL!');
        window.location.replace('index.html');
        return;
    }
    /*-----------------------+
     | Insert data into page |
     +-----------------------*/
    document.querySelector('iframe').contentWindow.location.replace('hypertext/' + targetID + '.htm');
    document.querySelector('#pageInfo img').src = 'image/' + targetID + '.png';
    document.querySelector('#imageExpand img').src = 'image/' + targetID + '.png';
    document.querySelector('#pageURL').textContent = page[targetID].url;
    document.querySelectorAll('#pageLinks a')[0].href = 'https://web.archive.org/web/0/' + page[targetID].url;
    document.querySelectorAll('#pageLinks a')[1].href = page[targetID].url;
    document.querySelectorAll('#pageLinks a')[2].href = 'hypertext/' + targetID + '.htm';
    document.querySelector('#pageCategory a').textContent = page[targetID].category;
    document.querySelector('#pageCategory a').href = 'results.html?category=' + page[targetID].category;
    for (let i = 0; i < page[targetID].keyword.length; i++) {
        let keywordLink = document.createElement('a');
        keywordLink.textContent = page[targetID].keyword[i];
        keywordLink.href = 'results.html?keyword=' + page[targetID].keyword[i].replaceAll('&', '%26');
        
        document.querySelector('#pageKeywords').insertAdjacentElement('beforeend', keywordLink);
        
        if (i != page[targetID].keyword.length - 1)
            document.querySelector('#pageKeywords').insertAdjacentText('beforeend', ', ');
    }
    document.querySelectorAll('#pageNavigation a')[0].href = window.location.pathname + '?url=' + page[(targetID - 1) ? (targetID - 1) : (page.length - 1)].url.replaceAll('#', '%23').replaceAll('&', '%26');
    document.querySelectorAll('#pageNavigation a')[1].href = window.location.pathname + '?url=' + page[Math.floor(Math.random() * 8046) + 1].url.replaceAll('#', '%23').replaceAll('&', '%26');
    document.querySelectorAll('#pageNavigation a')[2].href = window.location.pathname + '?url=' + page[(targetID + 1 == page.length) ? 1 : targetID + 1].url.replaceAll('#', '%23').replaceAll('&', '%26');
    
    // Make image expand upon click
    document.querySelectorAll('img').forEach(pageImage => {
        pageImage.addEventListener('click', () => {document.querySelector('#imageExpand').hidden ^= true;})
    });
    /*--------------------+
     | Coolify the iframe |
     +--------------------*/
    let pageFrame = document.querySelector('iframe');
    
    // "Highlight local links" checkbox handler
    document.querySelector('#localLinks').addEventListener('click', () => {
        pageFrame.contentDocument.querySelectorAll('a[local="true"]').forEach(localLink => {
            localLink.style.filter = document.querySelector('#localLinks').checked ? 'hue-rotate(-120deg)' : 'none';
        });
    });
    
    // "Plaintext view" checkbox handler
    function toggleTextView() {
        pageFrame.contentDocument.body.hidden ^= true;
        
        if (!document.querySelector('#textView').checked)
            pageFrame.contentDocument.querySelector('html > pre').remove()
        else {
            let plainText = pageFrame.contentDocument.body.textContent;
            let textContainer = pageFrame.contentDocument.createElement('pre');
            textContainer.style.margin = '8px';
            textContainer.textContent = plainText;
            pageFrame.contentDocument.body.insertAdjacentElement('beforebegin', textContainer);
        }
    }
    document.querySelector('#textView').addEventListener('click', toggleTextView);
    
    // This is literally the only way to check the readyState of an iframe
    let frameHandler = setInterval(() => {
        if (pageFrame.contentDocument.readyState === 'interactive') {
            // Prevent page from loading resources that probably don't exist 25+ years later
            pageFrame.contentWindow.stop();
            
            // Very rudimentary plaintext detection system
            if (pageFrame.contentDocument.querySelectorAll('*').length <= 3) {
                document.querySelector('#textView').checked = true;
                toggleTextView();
            }
            
            // Apply framed page title to parent
            if (pageFrame.contentDocument.querySelector('title'))
                document.title = pageFrame.contentDocument.querySelector('title').textContent + ' | ' + document.title;
            else
                document.title = page[targetID].url + ' | ' + document.title;
            
            // Remove the only image-loading attribute I know of
            if (pageFrame.contentDocument.body.hasAttribute('background'))
                pageFrame.contentDocument.body.removeAttribute('background');
            
            // Replicate functionality of a rare non-standard attribute meant to change the background color
            // Otherwise, make the background black in the case of bright text
            if (pageFrame.contentDocument.body.hasAttribute('rgb'))
                pageFrame.contentDocument.body.style.backgroundColor = pageFrame.contentDocument.body.getAttribute('rgb')
            else if (pageFrame.contentDocument.body.hasAttribute('text')) {
                let frameText = pageFrame.contentDocument.body.getAttribute('text').split('');
                if (frameText[0] == '#')
                    frameText.splice(0, 1);
                
                for (let i = 0; i < frameText.length; i += 2)
                    if ((frameText[i] + frameText[i + 1]).toUpperCase() == 'FF') {
                        pageFrame.contentDocument.body.style.backgroundColor = '#000000';
                        break;
                    }
            }
            
            // Insert placeholder for <isindex>
            if (pageFrame.contentDocument.querySelector('isindex')) {
                let index = document.createElement('form'),
                    topDivider = document.createElement('hr');
                
                index.setAttribute('onsubmit', 'return false');
                topDivider.setAttribute('style', 'margin-top: 28px');
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
                else
                    frameImage.insertAdjacentText('afterend', '[image]');
                frameImage.remove();
            });
            
            // Prevent <base> from screwing with page links
            if (pageFrame.contentDocument.querySelector('base'))
                pageFrame.contentDocument.querySelector('base').remove();
            
            // Redirect links to archival sites
            pageFrame.contentDocument.querySelectorAll('a[href]').forEach((frameLink, i) => {
                setTimeout(() => {
                    let currentDomain = new URL(page[targetID].url).origin;
                    let linkDomain = new URL(frameLink.href).host;
                    
                    if (!frameLink.getAttribute('href').startsWith('#') && 
                        !frameLink.getAttribute('href').startsWith('https://web.archive.org/') &&
                        !frameLink.getAttribute('href').startsWith(window.location.pathname)) {
                        frameLink.setAttribute('local', 'false');
                        frameLink.setAttribute('target', '_parent');
                        
                        
                        if (page.findIndex(obj => obj.url === frameLink.href) != -1) {
                            frameLink.setAttribute('local', 'true');
                            frameLink.href = window.location.pathname + '?url=' + frameLink.href;
                            if (document.querySelector('#localLinks').checked == true)
                                frameLink.style.filter = 'hue-rotate(-120deg)';
                        } else if (frameLink.href.includes('http://')) {
                            frameLink.setAttribute('target', '_blank');
                            
                            if (frameLink.getAttribute('href')[0] == '/')
                                frameLink.href = 'https://web.archive.org/web/0/' + currentDomain + frameLink.getAttribute('href')
                            else if (linkDomain == window.location.hostname)
                                if (frameLink.href[-1] == '/')
                                    frameLink.href = 'https://web.archive.org/web/0/' + page[targetID].url + '/' + frameLink.getAttribute('href')
                                else
                                    frameLink.href = 'https://web.archive.org/web/0/' + page[targetID].url.substring(0, page[targetID].url.lastIndexOf('/') + 1) + frameLink.getAttribute('href')
                            else
                                frameLink.href = 'https://web.archive.org/web/0/' + frameLink.href;
                        }
                    }
                }, i);
            });
            
            clearInterval(frameHandler);
        }
    }, 1);
}