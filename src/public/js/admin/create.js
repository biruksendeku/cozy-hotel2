document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('preview');
    
    let currentObjectUrl = null;

    // Handle file selection
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        // Clean up previous object URL
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = null;
        }
        
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                imageInput.value = '';
                return;
            }
            
            // Create object URL for the file
            currentObjectUrl = URL.createObjectURL(file);
            previewImage.src = currentObjectUrl;
            previewContainer.classList.add('active');
        } else {
            resetPreview();
        }
    });
});

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

// after form reset back to the table
const clearForm = document.getElementById('clearForm');
clearForm.addEventListener('click', () => {
	setTimeout(() => {
		window.location.href = '#form';
	}, 100);
});

const createItem = document.getElementById('createItem');
createItem.addEventListener('click', () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
});
