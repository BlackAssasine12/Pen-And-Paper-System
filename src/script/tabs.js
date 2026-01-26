// tabs.js

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabItems.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Ausgeblendete Items-Handling
    document.getElementById('toggleHiddenCheckbox').addEventListener('change', function() {
        // Die hidden-items Container Sichtbarkeit wird jetzt in hideButtons.js gehandhabt
        const hiddenItems = document.querySelector('.hidden-items');
        
        if (this.checked) {
            if (hiddenItems) {
                hiddenItems.style.display = 'block';
            }
            
            // Wenn der Checkbox ausgewählt ist, zeige den ausgeblendete-Tab
            tabItems.forEach(item => {
                if(item.getAttribute('data-tab') === 'ausgeblendete-tab') {
                    item.click();
                }
            });
        } else {
            if (hiddenItems) {
                hiddenItems.style.display = 'none';
            }
        }
    });
    
    // Set a default active tab
    if (tabItems.length > 0) {
        tabItems[0].click();
    }
});