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
    // Get query strings
    let query = new URLSearchParams(location.search),
        includes = query.get('includes'),
        keyword  = query.get('keyword'),
        category = query.get('category');
    
    // Hide subheader container if there are no parameters
    if (!(includes || keyword || category))
        document.querySelector('#resultsHeader table').style.display = 'none';
    
    // Populate subheader
    let table = document.querySelector('#resultsHeader table');
    
    if (includes)
        addTableRow(table, new Text('Title/URL includes: '), new Text(includes));
    if (keyword)
        addTableRow(table, new Text('Has keyword: '), new Text(keyword));
    if (category)
        addTableRow(table, new Text('In category: '), new Text(category));
    
    // Perform query and store URLs found in list into an array
    let resultPages = [];
    
    for (let i = 1; i < list.length; i++) {
        let parsedTitle = new DOMParser().parseFromString(list[i].title, 'text/html').body.textContent;
        
        if (includes &&
            !parsedTitle.toLowerCase().includes(includes.toLowerCase()) &&
            !list[i].url.toLowerCase().includes(includes.toLowerCase())
           )
            continue;
        if (keyword && !list[i].keyword.includes(keyword))
            continue;
        if (category && category != 'All' && category != list[i].category)
            continue;
        
        resultPages.push([parsedTitle, list[i].url]);
    }
    
    // Display message if no URLs were found in list
    if (resultPages.length == 0) {
        document.querySelector('#results').textContent = 'No results :(';
        return;
    }
    
    // Sort URLs alphabetically
    resultPages.sort((a, b) => a[0].toLowerCase() > b[0].toLowerCase());
    
    // Display results on page
    for (let i = 0; i < resultPages.length; i++) {
        let resultLink = document.createElement('a');
        resultLink.href = 'viewer.html?url=' + resultPages[i][1].replaceAll('#', '%23').replaceAll('&', '%26');
        resultLink.textContent = 'Go';
        
        addTableRow(document.querySelector('#results'), new Text(resultPages[i][0]), new Text(resultPages[i][1]), resultLink);
    }
}

/*-------------------+
 | Helpful functions |
 +-------------------*/
// Add rows to desired table
function addTableRow(table, ...args) {
    let row = document.createElement('tr');
    
    for (let i = 0; i < args.length; i++) {
        item = document.createElement('td');
        item.appendChild(args[i]);
        row.appendChild(item);
    }
    
    table.appendChild(row);
}