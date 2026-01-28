// tabs.js

const initializeTabs = () => {
    // Tab functionality
    const tabItems = document.querySelectorAll<HTMLElement>('.tab-item');
    const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');
    
    tabItems.forEach((tab) => {
        tab.addEventListener('click', function (event) {
            const target = event.currentTarget;
            if (!(target instanceof HTMLElement)) {
                return;
            }
            // Remove active class from all tabs
            tabItems.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked tab
            target.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = target.getAttribute('data-tab');
            if (!tabId) {
                return;
            }
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    
    // Ausgeblendete Items-Handling
    const hiddenCheckbox = document.getElementById('toggleHiddenCheckbox');
    if (hiddenCheckbox) {
        hiddenCheckbox.addEventListener('change', function (event) {
            const target = event.target as HTMLInputElement | null;
            if (!target) {
                return;
            }
        // Die hidden-items Container Sichtbarkeit wird jetzt in hideButtons.js gehandhabt
            const hiddenItems = document.querySelector<HTMLElement>('.hidden-items');
        
            if (target.checked) {
                if (hiddenItems) {
                    hiddenItems.style.display = 'block';
                }
            
            // Wenn der Checkbox ausgewählt ist, zeige den ausgeblendete-Tab
            tabItems.forEach((item) => {
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
    }
    
    // Set a default active tab
    if (tabItems.length > 0) {
        tabItems[0].click();
    }
};

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', initializeTabs);
} else {
    initializeTabs();
}

export {};
