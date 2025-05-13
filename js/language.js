// Language switcher functionality for Beldi Fusion Kitchen
let currentLang = 'en'; // Default language

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language
    initializeLanguage();

    // Apply translations to menu items
    updateMenuTranslations();
});

// Set the language and apply translations
function applyLanguage(lang) {
    currentLang = lang;
    
    // Save language preference to local storage
    localStorage.setItem('beldi-language', lang);
    
    // Update the UI direction for Arabic
    if (lang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
    } else {
        document.body.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');
    }
    
    // Update active class on language selector
    const languageItems = document.querySelectorAll('.language-dropdown li');
    languageItems.forEach(item => {
        if (item.getAttribute('data-lang') === lang) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Apply translations to all elements with data-lang-key attribute
    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[currentLang] && translations[currentLang][key]) {
            // Handle special attributes like placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[currentLang][key];
            } else {
                // Regular content replacement
                element.innerHTML = translations[currentLang][key];
            }
        }
    });
    
    // Update the current language indicator if exists
    const currentLangIndicator = document.querySelector('.current-lang span');
    if (currentLangIndicator) {
        currentLangIndicator.textContent = lang.toUpperCase();
    }
    
    // Translate menu items if already loaded
    translateMenuItems();
    
    // Dispatch an event so other scripts can respond to language change
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Initialize language based on browser settings or localStorage
function initializeLanguage() {
    // Check if user has previously selected a language
    const savedLanguage = localStorage.getItem('beldi-language');
    
    if (savedLanguage) {
        applyLanguage(savedLanguage);
    } else {
        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (['en', 'fr', 'ar'].includes(browserLang)) {
            applyLanguage(browserLang);
        } else {
            applyLanguage('en'); // Default to English
        }
    }
    
    // Set up language selector functionality
    const languageItems = document.querySelectorAll('.language-dropdown li');
    languageItems.forEach(item => {
        item.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            applyLanguage(lang);
        });
    });
}

// Update translations for menu items from script.js
function updateMenuTranslations() {
    // Only apply this after menu items have been loaded
    document.addEventListener('menuLoaded', function() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        // Apply translations to dynamic menu content
        if (menuItems.length > 0) {
            translateMenuItems();
        }
    });
}

// Translate dynamically loaded menu items
function translateMenuItems() {
    // Get menu items
    const menuItems = document.querySelectorAll('.menu-item');
    
    // For each menu item, check if we have a translation for its category
    menuItems.forEach(item => {
        const categoryElement = item.querySelector('.category');
        if (categoryElement) {
            const category = categoryElement.textContent.trim();
            const categoryKey = getCategoryKey(category);
            
            if (categoryKey && translations[currentLang] && translations[currentLang][categoryKey]) {
                categoryElement.textContent = translations[currentLang][categoryKey];
            }
        }
        
        // Also translate the "Add to Cart" button if present
        const addToCartBtn = item.querySelector('.add-to-cart');
        if (addToCartBtn && translations[currentLang] && translations[currentLang]['add-to-cart']) {
            addToCartBtn.textContent = translations[currentLang]['add-to-cart'];
        }
    });
    
    // Translate filter buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        const category = btn.textContent.trim();
        const categoryKey = getCategoryKey(category);
        
        if (categoryKey && translations[currentLang] && translations[currentLang][categoryKey]) {
            btn.textContent = translations[currentLang][categoryKey];
        }
    });
}

// Helper function to get translation key for category
function getCategoryKey(category) {
    const categoryMap = {
        'All': 'cat-all',
        'Tajines': 'cat-tajines',
        'Main Dishes': 'cat-main',
        'Pasta': 'cat-pasta',
        'Burgers & Sandwiches': 'cat-burgers',
        'Starters': 'cat-starters',
        'Salads': 'cat-salads',
        'Sushi': 'cat-sushi',
        'Desserts': 'cat-desserts',
        'Drinks': 'cat-drinks',
        'Smoothies': 'cat-smoothies',
        'Fresh Juices': 'cat-juices'
    };
    
    return categoryMap[category];
} 