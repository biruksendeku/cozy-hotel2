// Simple JavaScript for Orders Page

document.addEventListener('DOMContentLoaded', function() {
    
    // Table row click for view details
    const tableRows = document.querySelectorAll('.orders-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            // Only if not clicking on action buttons or checkboxes
            if (!e.target.closest('.actions-cell') && !e.target.closest('.bulk-select')) {
                const viewLink = this.querySelector('.action-view');
                if (viewLink) {
                    window.location.href = viewLink.href;
                }
            }
        });
    });
    
    // Bulk selection
    const selectAllCheckbox = document.getElementById('selectAll');
    const orderCheckboxes = document.querySelectorAll('.order-checkbox');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            orderCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateSelectedCount();
        });
    }
    
    // Update selected count
    function updateSelectedCount() {
        const selected = document.querySelectorAll('.order-checkbox:checked').length;
        const countElement = document.querySelector('.selected-count');
        if (countElement) {
            countElement.textContent = `(${selected} selected)`;
        }
    }
    
    // Confirm before deleting
    const deleteButtons = document.querySelectorAll('.action-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent row click
            if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                // Implement delete logic here
                console.log('Delete order');
            }
        });
    });
    
    // Search input clear button
    const clearBtn = document.querySelector('.clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            window.location.href = '/admin/orders';
        });
    }
    
    // Filter apply
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            // Optional: Auto-submit form on filter change
            // this.closest('form').submit();
        });
    });
});

// Bulk action functions
function toggleSelectAll(checkbox) {
    const orderCheckboxes = document.querySelectorAll('.order-checkbox');
    orderCheckboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
    updateSelectedCount();
}

function updateSelectedCount() {
    const selected = document.querySelectorAll('.order-checkbox:checked').length;
    const countElement = document.querySelector('.selected-count');
    if (countElement) {
        countElement.textContent = `(${selected} selected)`;
    }
}

function updateStatus(status) {
    const selected = document.querySelectorAll('.order-checkbox:checked');
    if (selected.length === 0) {
        alert('Please select at least one order to update.');
        return;
    }
    
    const orderIds = Array.from(selected).map(cb => cb.value);
    if (confirm(`Update ${selected.length} order(s) to ${status}?`)) {
        // Implement status update logic here
        console.log(`Updating orders to ${status}:`, orderIds);
    }
}

function deleteSelected() {
    const selected = document.querySelectorAll('.order-checkbox:checked');
    if (selected.length === 0) {
        alert('Please select at least one order to delete.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selected.length} order(s)? This action cannot be undone.`)) {
        const orderIds = Array.from(selected).map(cb => cb.value);
        // Implement delete selected logic here
        console.log('Deleting orders:', orderIds);
    }
}

function editOrder(orderId) {
    // Implement edit order logic
    console.log('Edit order:', orderId);
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        // Implement delete order logic
        console.log('Delete order:', orderId);
    }
}

function exportOrders() {
    // Implement export logic
    alert('Export functionality coming soon!');
}

function printOrders() {
    window.print();
}

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
