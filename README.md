# wwwdirectory-js
This is an attempt to recreate and expand upon (in JavaScript) the functionality of the <a href="https://archive.org/details/www-dir-cd">World Wide Web Directory CD-ROM</a>, published by Jamsa Press in 1995. 

## Usage
The extracted files from the collection cannot be found inside this repository; you must download them <a href="https://archive.org/details/jamsapresswwwdirectory">here</a>. Afterwards, merge these two and move it all under a web server (preferably localhost) and you should be good to go.

## Issues
Apparently people in 1995 had a hard time ensuring their `href` attributes were encased by two quotations instead of one, and for that reason a handful of pages are screwed up because it ends up consuming everything before the next quotation. Similar thing with comments.