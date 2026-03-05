// home.js - Handles cart operations without page refresh

// Check cart status for all items on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Get all food IDs on the page
    const foodButtons = document.querySelectorAll('.add-to-cart');
    const foodIds = Array.from(foodButtons).map(btn => btn.dataset.foodId);
    
    if (foodIds.length > 0) {
        await checkMultipleCartStatus(foodIds);
    }
    
    // Load initial cart count
    fetch('/cart/count')
        .then(res => res.json())
        .then(data => {
            if (data && typeof data.count !== 'undefined') {
                updateCartCount(data.count);
            }
        })
        .catch(() => {});
});

// Check status for multiple food items
async function checkMultipleCartStatus(foodIds) {
    try {
        const response = await fetch('/cart/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ foodIds })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update each item's status
            Object.entries(data.cartStatus).forEach(([foodId, inCart]) => {
                updateItemStatus(foodId, inCart);
            });
        }
    } catch (error) {
        console.error('Error checking cart status:', error);
    }
}

// Check status for single food item
async function checkSingleCartStatus(foodId) {
    try {
        const response = await fetch(`/cart/status/${foodId}`);
        const data = await response.json();
        
        if (data.success) {
            updateItemStatus(foodId, data.inCart);
        }
    } catch (error) {
        console.error('Error checking cart status:', error);
    }
}

// Update UI based on cart status
function updateItemStatus(foodId, inCart) {
    const button = document.querySelector(`.add-to-cart[data-food-id="${foodId}"]`);
    const checkStatus = document.querySelector(`.check-status[data-food-id="${foodId}"]`);
    
    if (button && checkStatus) {
        if (inCart) {
            button.style.display = 'none';
            checkStatus.style.display = 'flex';
        } else {
            button.style.display = 'flex';
            checkStatus.style.display = 'none';
        }
    }
}

// Main function to add items to cart
window.addToCart = function(foodItem) {
    // Parse the food item safely
    let food;
    try {
        food = typeof foodItem === 'string' ? JSON.parse(foodItem) : foodItem;
    } catch (e) {
        console.error('Error parsing food item:', e);
        showNotification('Error adding item to cart', 'error');
        return;
    }

    const foodId = food._id || food.id;

    // Prepare cart data
    const cartData = {
        foodId: foodId,
        name: food.name,
        price: food.price,
        quantity: 1,
        imageUrl: food.imageUrl
    };

    // Send POST request
    fetch('/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response failed');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification(`${food.name} added to cart!`, 'success');
            updateCartCount(data.cartCount);
            updateItemStatus(foodId, true); // Update status to "in cart"
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
        
        if (count === 0) {
            cartLenShow.style.display = 'none';
        } else {
            cartLenShow.style.display = 'inline-block';
        }
    }
}

// Show notification
function showNotification(message, type) {
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 300);
    }, 2500);
}
