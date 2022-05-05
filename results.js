/*--------------------+
 | Retrieve JSON data |
 +--------------------*/
let request = new XMLHttpRequest();
request.open('GET', 'list.json');
request.responseType = 'json';
request.onload = function() {handleQuery(this.response)};
request.send();

/*-----------------------+
 | Display query results |
 +-----------------------*/
function handleQuery(list) {
    // Apply header based on query type
    let query = new URLSearchParams(location.search);
    
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
    
    // Perform query and store URLs found in list into an array
    let resultURLs = [];
    
    for (let i = 1; i < list.length; i++)
        if (query.get('domain') && (query.get('domain').toLowerCase() == list[i].url.substr(7, list[i].url.indexOf('/', 7) - 7).toLowerCase()))
            resultURLs.push(list[i].url)
        else if (query.get('category') == list[i].category || query.get('category') == 'All')
            resultURLs.push(list[i].url)
        else if (list[i].keyword.includes(query.get('keyword')) && !query.get('category'))
            resultURLs.push(list[i].url);
    
    // Display message if no URLs were found in list
    if (resultURLs.length == 0) {
        document.querySelector('#results').textContent = 'No results :(';
        return;
    }
    
    // Sort URLs alphabetically
    resultURLs.sort();
    
    // Display results on page
    for (let i = 0; i < resultURLs.length; i++) {
        let result = document.createElement('a');
        // Fix problematic characters
        result.href = 'viewer.html?url=' + resultURLs[i].replaceAll('#', '%23').replaceAll('&', '%26');
        result.textContent = resultURLs[i];
        
        document.querySelector('#results').insertAdjacentElement('beforeend', result);
    }
}