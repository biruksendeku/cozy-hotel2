// home.js - Handles cart operations without page refresh

function escapeHtml(value) {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => entities[character]);
}

// Main function to add items to cart
window.addToCart = function(foodId) {
    if (typeof foodId !== 'string' || !foodId.trim()) {
        showNotification('Failed to add item to cart', 'error');
        return;
    }

    // Send POST request
    fetch('/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ foodId: foodId.trim() })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response failed');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification(data.message || 'Item added to cart', 'success');
            updateCartCount(data.cartCount);
            
        } else {
            showNotification(data.message || 'Failed to add item', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to add item to cart', 'error');
    });
};

// Update cart count in header
function updateCartCount(count) {
    const cartLenShow = document.getElementById('cartLenShow');
    if (cartLenShow) {
        cartLenShow.textContent = count;
        
        // Add pulse animation
        cartLenShow.classList.add('update');
        setTimeout(() => {
            cartLenShow.classList.remove('update');
        }, 300);
        
        // Hide when zero
        if (count === 0) {
            cartLenShow.style.display = 'none';
        } else {
            cartLenShow.style.display = 'inline-block';
        }
    }
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Auto remove after 2.5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 300);
    }, 2500);
}

// Load initial cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    fetch('/cart/count')
        .then(res => {
            if (!res.ok) throw new Error('Network response failed');
            return res.json();
        })
        .then(data => {
            if (data && typeof data.count !== 'undefined') {
                updateCartCount(data.count);
            }
        })
        .catch(() => {
            // Silently fail - non-critical
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

/* ============ SEARCH RESULTS CODE ========== */
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const foodsContainer = document.getElementById('foods-list-container');
  
  // Store the original foods HTML to restore when search is empty
  const originalFoodsHTML = foodsContainer.innerHTML;
  
  // Handle form submission
  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault(); // This prevents page refresh!
    
    const searchTerm = searchInput.value.trim();
    
    // If search is empty, show all foods
    if (searchTerm === '') {
      foodsContainer.innerHTML = originalFoodsHTML;
      return;
    }
    
    try {
      // Show loading state
      foodsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
      
      // Make the search request
      const response = await fetch(`/search-foods?name=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const foods = await response.json();
      
      // Update the UI with search results
      updateFoodsList(foods);
      
    } catch (error) {
      console.error('Search error:', error);
      foodsContainer.innerHTML = '<div class="error-message">Something went wrong. Please try again.</div>';
    }
  });
  
  // Optional: Add search as you type (debounced)
  let debounceTimer;
  searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Trigger form submit
      searchForm.dispatchEvent(new Event('submit'));
    }, 500); // Wait 500ms after user stops typing
  });
  
  // Function to update foods list
  function updateFoodsList(foods) {
    if (!foodsContainer) return;
    
    if (foods.length === 0) {
      foodsContainer.innerHTML = '<div class="no-results"><h2>No foods found</h2><p>Try searching with different keywords.</p></div>';
      return;
    }
    
    // Build HTML for search results
    let foodsHTML = '';
    
    foods.forEach(f => {
      const foodTag = escapeHtml((f.category || 'FRESH').toUpperCase());
      const rating = escapeHtml(f.rating || 4.5);
      const calorie = escapeHtml(f.calorie || 'N/A');
      const prepTime = escapeHtml(f.preparationTime || '15-20 min');
      const foodInfo = escapeHtml(f.foodInfo || 'Delicious fresh food prepared with care');
      const imageUrl = escapeHtml(f.imageUrl || '/images/default-food.jpg');
      const foodName = escapeHtml(f.name);
      const foodPrice = escapeHtml(f.price);
      const foodId = escapeHtml(f._id);
      
      foodsHTML += `
        <div class="foods-container" id="foods">
          <div class="menu-image-container">
            <span class="food-image-tag">${foodTag}</span>
            <div class="food-image">
              <img src="${imageUrl}" alt="${foodName}">
            </div>
            <span class="food-rating-tag">
              <i class="fas fa-star"></i>
              ${rating}
            </span>
          </div>
          
          <div class="menu-data">
            <div class="food-data-container">
              <span class="food-name">
                <h1>${foodName}</h1>
              </span>
              <span class="food-price">
                <h1>$${foodPrice}</h1>
              </span>
            </div>
            
            <div class="food-info">
              ${foodInfo}
            </div>
            
            <hr>
            
            <div class="food-action-data">
              <div class="food-action-container">
                <span class="food-time">
                  <i class="fas fa-clock"></i>
                  ${prepTime}
                </span>
                |
                <span class="food-energy">
                  <i class="fas fa-fire"></i>
                  ${calorie} Kcal
                </span>
              </div>
              
              <div class="food-action">
                <button class="add-to-cart" data-food-id="${foodId}">
                  <i class="fas fa-plus"></i>
                  Add to Cart
                  <span class="added-show">
                    <i class="fas fa-check-circle"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    foodsContainer.innerHTML = foodsHTML;
  }

  if (foodsContainer) {
    foodsContainer.addEventListener('click', event => {
      const button = event.target.closest('.add-to-cart');
      if (!button || !foodsContainer.contains(button)) return;
      window.addToCart(button.dataset.foodId);
    });
  }
  
});

const headerSearch = document.getElementById('headerSearch');
const headerSearchButton = document.getElementById('headerSearchButton');

headerSearchButton.addEventListener('click', showSearch);

function showSearch() {
	headerSearchButton.style.display = "none";
	headerSearch.style.display = "flex";
};
