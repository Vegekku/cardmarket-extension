chrome.storage.sync.get('terms', function(data) {
    if (data.terms && data.terms.length > 0) {
        highlightTerms(data.terms);
    }
});

function highlightTerms(terms) {
    terms.forEach(term => {
        if (term) {
            let regex = new RegExp(`(${term})`, 'gi');
            document.body.innerHTML = document.body.innerHTML.replace(regex, '<span style="background-color: yellow;">$1</span>');
        }
    });
}
