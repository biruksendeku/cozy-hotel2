// the links span bars
const showLinks = document.getElementById('showLinks');
const hideLinks = document.getElementById('hideLinks');
const allOtherLinks = document.getElementById('allOtherLinks');

showLinks.addEventListener('click', showAllLinks);
hideLinks.addEventListener('click', hideAllLinks);

function showAllLinks() {
        allOtherLinks.style.display = "flex";
        showLinks.style.display = "none";
        hideLinks.style.display = "block";
};

function hideAllLinks() {
        allOtherLinks.style.display = "none";
        hideLinks.style.display = "none";
        showLinks.style.display = "block";
}
