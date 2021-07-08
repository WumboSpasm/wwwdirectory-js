/*--------------------+
 | Retrieve JSON data |
 +--------------------*/
let request = new XMLHttpRequest();
request.open('GET', 'metadata.json');
request.responseType = 'json';
request.onload = function() {populateDropdown(this.response)};
request.send();

function populateDropdown(page) {
    let categorySelect = document.querySelector('#category');
    /*-------------------------------------+
     | Populate dropdown menu with options |
     +-------------------------------------*/
    for (let i = 1; i <= 8046; i++) {
        for (let j = 0; j < categorySelect.options.length; j++) {
            if (categorySelect.options[j].value == page[i].category)
                categorySelect.options[j].textContent = page[i].category + ' (' + (parseInt(categorySelect.options[j].textContent.match(/(?<=\()(.*)(?=\))/)[0]) + 1) + ')';
            else if (j == categorySelect.options.length - 1) {
                let newCategory = document.createElement('option');
                newCategory.value = page[i].category;
                newCategory.textContent = page[i].category + ' (0)';
                categorySelect.add(newCategory);
            }
        }
    }
    document.querySelector('button').addEventListener('click', () => {
        window.location.href = 'results.html?category=' + categorySelect.options[categorySelect.selectedIndex].value;
    });
}