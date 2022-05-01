/*--------------------+
 | Retrieve JSON data |
 +--------------------*/
let request = new XMLHttpRequest();
request.open('GET', 'list.json');
request.responseType = 'json';
request.onload = function() {populateDropdown(this.response)};
request.send();

/*------------------------+
 | Handle category search |
 +------------------------*/
function populateDropdown(list) {
    let categorySelect = document.querySelector('#category');
    
    // Populate dropdown menu with options
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
    
    document.querySelector('button').addEventListener('click', () => {
        window.location.href = 'results.html?category=' + categorySelect.options[categorySelect.selectedIndex].value;
    });
}

/*----------------------+
 | Handle domain search |
 +----------------------*/
document.querySelectorAll('button')[1].addEventListener('click', () => {
    if (document.querySelector('#domain').value)
        window.location.href = 'results.html?domain=' + document.querySelector('#domain').value;
});
document.querySelector('#domain').addEventListener('keydown', key => {
    if (key.code == 'Enter' && document.querySelector('#domain').value)
        window.location.href = 'results.html?domain=' + document.querySelector('#domain').value;
});