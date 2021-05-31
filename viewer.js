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
    document.querySelectorAll('#pageLinks a')[0].href = 'https://web.archive.org/web/1996fw_/' + page[targetID].url;
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
    console.log(targetID);
    document.querySelectorAll('#pageNavigation a')[0].href = window.location.pathname + '?url=' + page[(targetID - 1) ? (targetID - 1) : (page.length - 1)].url.replaceAll('#', '%23').replaceAll('&', '%26');
    document.querySelectorAll('#pageNavigation a')[1].href = window.location.pathname + '?url=' + page[Math.floor(Math.random() * 8046) + 1].url.replaceAll('#', '%23').replaceAll('&', '%26');
    document.querySelectorAll('#pageNavigation a')[2].href = window.location.pathname + '?url=' + page[(targetID + 1 == page.length) ? 1 : targetID + 1].url.replaceAll('#', '%23').replaceAll('&', '%26');
    /*------------------------------+
     | Make image expand upon click |
     +------------------------------*/
    function viewImage() {
        if (document.querySelector('#imageExpand').hidden)
            document.querySelector('#imageExpand').hidden = false
        else
            document.querySelector('#imageExpand').hidden = true;
    }
    document.querySelector('#pageInfo img').addEventListener('click', viewImage);
    document.querySelector('#imageExpand img').addEventListener('click', viewImage);
    /*--------------------+
     | Coolify the iframe |
     +--------------------*/
    let pageFrame = document.querySelector('iframe');
    
    function toggleTextView() {
        if (!document.querySelector('#textView').checked) {
            pageFrame.contentDocument.querySelector('html > pre').remove();
            pageFrame.contentDocument.body.hidden = false;
        } else {
            plainText = pageFrame.contentDocument.body.textContent;
            pageFrame.contentDocument.body.hidden = true;
            textContainer = pageFrame.contentDocument.createElement('pre');
            textContainer.style.margin = '8px';
            textContainer.textContent = plainText;
            pageFrame.contentDocument.body.insertAdjacentElement('beforebegin', textContainer);
        }
    }
    document.querySelector('#textView').addEventListener('click', toggleTextView);
    
    // This is literally the only way to check the readyState of an iframe
    setInterval(function() {
        if (pageFrame.contentDocument.readyState === 'interactive') {
            pageFrame.contentWindow.stop();
            
            // Very rudimentary plaintext detection system, should probably be replaced with a user toggle
            if (pageFrame.contentDocument.querySelectorAll('*').length <= 3) {
                document.querySelector('#textView').checked = true;
                toggleTextView();
            }
            
            if (pageFrame.contentDocument.querySelector('title'))
                document.title = pageFrame.contentDocument.querySelector('title').textContent + ' | ' + document.title;
            else
                document.title = page[targetID].url + ' | ' + document.title;
            
            if (pageFrame.contentDocument.body.background)
                pageFrame.contentDocument.body.removeAttribute('background');
            
            let frameImages = pageFrame.contentDocument.querySelectorAll('img');
            for (let i = 0; i < frameImages.length; i++) {
                if (frameImages[i].alt)
                    frameImages[i].insertAdjacentText('afterend', frameImages[i].alt);
                frameImages[i].style.display = 'none';
            }
            
            if (pageFrame.contentDocument.querySelector('base'))
                pageFrame.contentDocument.querySelector('base').remove();
            
            let frameLinks = pageFrame.contentDocument.querySelectorAll('a');
            for (let i = 0; i < frameLinks.length; i++) {
                // Prevents link replacement algorithm from tanking performance
                setTimeout(function() {
                    if (!frameLinks[i].href)
                        return;
                    
                    let currentDomain = new URL(page[targetID].url).origin;
                    let linkDomain = new URL(frameLinks[i].href).host;
                    
                    if (!frameLinks[i].getAttribute('href').startsWith('#')) {
                        // Replaces links with the on-site version if they exist in the archive
                        if (page.findIndex(obj => obj.url === frameLinks[i].href) != -1)
                            frameLinks[i].href = window.location.pathname + '?url=' + frameLinks[i].href
                        else if (frameLinks[i].href.includes('http://'))
                            if (frameLinks[i].getAttribute('href')[0] == '/')
                                frameLinks[i].href = 'https://web.archive.org/web/1996fw_/' + currentDomain + frameLinks[i].getAttribute('href')
                            else if (linkDomain == window.location.hostname)
                                if (frameLinks[i].href[-1] == '/')
                                    frameLinks[i].href = 'https://web.archive.org/web/1996fw_/' + page[targetID].url + '/' + frameLinks[i].getAttribute('href')
                                else
                                    frameLinks[i].href = 'https://web.archive.org/web/1996fw_/' + page[targetID].url.substring(0, page[targetID].url.lastIndexOf('/') + 1) + frameLinks[i].getAttribute('href')
                            else
                                frameLinks[i].href = 'https://web.archive.org/web/1996fw_/' + frameLinks[i].href;
                        
                        frameLinks[i].setAttribute('target', '_parent');
                    }
                }, 1);
            }
            
            return;
        }
    }, 1);
}