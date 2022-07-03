/*--------------------+
 | Retrieve JSON data |
 +--------------------*/
let request = new XMLHttpRequest();
request.open('GET', 'list.json');
request.responseType = 'json';
request.onload = function() {populateDropdown(this.response)};
request.send();

/*--------------------+
 | Display categories |
 +--------------------*/
function populateDropdown(list) {
    let categorySelect = document.querySelector('#category');
    
    for (let i = 1; i <= 8046; i++) {
        for (let j = 0; j < categorySelect.options.length; j++) {
            if (categorySelect.options[j].value == list[i].category)
                categorySelect.options[j].textContent = list[i].category + ' (' + (parseInt(categorySelect.options[j].textContent.match(/(?<=\()(.*)(?=\))/)[0]) + 1) + ')';
            else if (j == categorySelect.options.length - 1) {
                let newCategory = document.createElement('option');
                newCategory.value = list[i].category;
                newCategory.textContent = list[i].category + ' (0)';
                
                categorySelect.add(newCategory);
            }
        }
    }
}

/*--------------+
 | Generate URL |
 +--------------*/
function generateURL() {
    let searchIncludes = !!document.querySelector('#includes').value,
        searchKeyword = !!document.querySelector('#keyword').value;
    
    let querySegments = [];
    
    if (searchIncludes)
        querySegments.push('includes=' + encodeURIComponent(document.querySelector('#includes').value));
    if (searchKeyword)
        querySegments.push('keyword=' + encodeURIComponent(document.querySelector('#keyword').value));
    if (document.querySelector('#category').value != 'All')
        querySegments.push('category=' + document.querySelector('#category').value);
    
    window.location.href = 'results.html' + (querySegments.length > 0 ? ('?' + querySegments.join('&')) : '');
}

document.querySelector('#search button').addEventListener('click', () => { generateURL() });
document.querySelector('#search').addEventListener('keydown', key => { if (key.code == 'Enter') generateURL(); });