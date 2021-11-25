/*--------------------+
 | Retrieve JSON data |
 +--------------------*/
let request = new XMLHttpRequest();
request.open('GET', 'metadata.json');
request.responseType = 'json';
request.onload = function() {handleQuery(this.response)};
request.send();
/*-----------------------+
 | Display query results |
 +-----------------------*/
function handleQuery(page) {
    query = new URLSearchParams(location.search);
    if (query.has('domain'))
        document.querySelector('#query').textContent = 'Domain: ' + query.get('domain')
    else if (query.has('category'))
        document.querySelector('#query').textContent = 'Category: ' + query.get('category')
    else if (query.has('keyword'))
        document.querySelector('#query').textContent = 'Keyword: ' + query.get('keyword')
    else {
        alert('Invalid query!');
        window.location.replace('index.html');
    }
    
    let resultURLs = [];
    for (let i = 1; i <= 8046; i++)
        if (query.get('domain') == page[i].url.substr(7, page[i].url.indexOf('/', 7) - 7))
            resultURLs.push(page[i].url)
        else if (query.get('category') == page[i].category || query.get('category') == 'All')
            resultURLs.push(page[i].url)
        else if (page[i].keyword.includes(query.get('keyword')) && !query.get('category'))
            resultURLs.push(page[i].url);
    
    if (resultURLs.length == 0) {
        document.querySelector('#results').textContent = 'No results :(';
        return;
    }
    
    resultURLs.sort();
    for (let i = 0; i < resultURLs.length; i++) {
        let result = document.createElement('a');
        result.href = 'viewer.html?url=' + resultURLs[i].replaceAll('#', '%23').replaceAll('&', '%26');
        result.textContent = resultURLs[i];
        document.querySelector('#results').insertAdjacentElement('beforeend', result);
    }
}