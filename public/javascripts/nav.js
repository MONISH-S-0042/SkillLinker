const links = document.querySelectorAll('a');
let currentUrl = window.location.href;
for (let link of links) {
    if (link.href == currentUrl && link.innerText!='Skill Linker') {
        link.classList.add('active-link');
    }
    else {
        link.classList.remove('active-link');
    }
}