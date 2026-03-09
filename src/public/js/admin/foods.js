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


// POPUP OF THE DELETE ACTION
function confirmDelete() {
	Swal.fire({
    	title: "Are you sure?",
        text: "You won't be able to revert this action!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Delete it!"
	}).then((result) => {
    	if(result.isConfirmed) {
        	document.getElementById('deleteForm').submit();
        }
	}).catch((err) => {
    	// refresh for failures - not gonna help! Add More!!!
        window.location.href = "/admin/foods#foods";
	});
};
