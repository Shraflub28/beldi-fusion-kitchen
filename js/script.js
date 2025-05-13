// Beldi Fusion Kitchen - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initMobileMenu();
    initMenuFilter();
    initCartFunctionality();
    initSmoothScroll();
    loadMenuItems();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Toggle between hamburger and close icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// Menu Category Filter
function initMenuFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected category
            const category = this.dataset.category;
            filterMenuItems(category);
        });
    });
}

function filterMenuItems(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Cart Functionality
function initCartFunctionality() {
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.querySelector('.cart-modal');
    const closeCartBtn = document.querySelector('.close-cart');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    
    // Open cart modal
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            cartModal.style.display = 'block';
        });
    }
    
    // Close cart modal
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    // Add to cart functionality
    addToCartBtns.forEach(button => {
        button.addEventListener('click', function() {
            const dishCard = this.closest('.dish-card, .menu-item');
            if (dishCard) {
                const dishName = dishCard.querySelector('h3').textContent;
                const dishPrice = dishCard.querySelector('.price').textContent;
                const dishImg = dishCard.querySelector('img').src;
                
                addToCart(dishName, dishPrice, dishImg);
                updateCartCount();
                
                // Show notification
                showNotification(`${dishName} added to cart`);
            }
        });
    });
    
    // Order Now Button Click
    const orderBtn = document.querySelector('.order-btn');
    if (orderBtn) {
        orderBtn.addEventListener('click', function() {
            cartModal.style.display = 'block';
        });
    }
    
    // Add event listener for menu view button
    const menuViewBtn = document.querySelector('.cta-button');
    if (menuViewBtn) {
        menuViewBtn.addEventListener('click', function() {
            const menuSection = document.getElementById('menu');
            menuSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// Cart Operations
function addToCart(name, price, imgSrc) {
    const cartItems = document.querySelector('.cart-items');
    const cartItemsArray = getCartItems();
    
    // Check if item already exists in cart
    const existingItem = cartItemsArray.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
        updateCartStorage(cartItemsArray);
        renderCartItems();
    } else {
        // Create new cart item
        const newItem = {
            name: name,
            price: price,
            img: imgSrc,
            quantity: 1
        };
        
        cartItemsArray.push(newItem);
        updateCartStorage(cartItemsArray);
        renderCartItems();
    }
    
    updateCartTotal();
}

function removeFromCart(name) {
    let cartItems = getCartItems();
    cartItems = cartItems.filter(item => item.name !== name);
    updateCartStorage(cartItems);
    renderCartItems();
    updateCartCount();
    updateCartTotal();
}

function updateQuantity(name, change) {
    const cartItems = getCartItems();
    const item = cartItems.find(item => item.name === name);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            updateCartStorage(cartItems);
            renderCartItems();
            updateCartTotal();
        }
    }
}

function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartItems = getCartItems();
    
    // Clear current items
    cartItemsContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        return;
    }
    
    // Add each item to cart
    cartItems.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        
        const priceValue = item.price.replace(/[^\d]/g, '');
        const totalPrice = parseInt(priceValue) * item.quantity;
        
        cartItemElement.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.img}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${item.price}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-name="${item.name}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-name="${item.name}">+</button>
                </div>
            </div>
            <div class="cart-item-total">${totalPrice} DH</div>
            <button class="remove-item" data-name="${item.name}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners for quantity buttons and remove buttons
    const minusButtons = document.querySelectorAll('.quantity-btn.minus');
    const plusButtons = document.querySelectorAll('.quantity-btn.plus');
    const removeButtons = document.querySelectorAll('.remove-item');
    
    minusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.dataset.name;
            updateQuantity(name, -1);
        });
    });
    
    plusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.dataset.name;
            updateQuantity(name, 1);
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const name = this.dataset.name;
            removeFromCart(name);
        });
    });
}

function updateCartTotal() {
    const cartItems = getCartItems();
    const totalElement = document.getElementById('cart-total-price');
    
    let total = 0;
    cartItems.forEach(item => {
        const priceValue = item.price.replace(/[^\d]/g, '');
        total += parseInt(priceValue) * item.quantity;
    });
    
    if (totalElement) {
        totalElement.textContent = `${total} DH`;
    }
}

function updateCartCount() {
    const cartItems = getCartItems();
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
        let totalItems = 0;
        cartItems.forEach(item => {
            totalItems += item.quantity;
        });
        
        cartCount.textContent = totalItems;
    }
}

// Cart Storage Functions
function getCartItems() {
    const cartItems = localStorage.getItem('beldiFusionCart');
    return cartItems ? JSON.parse(cartItems) : [];
}

function updateCartStorage(cartItems) {
    localStorage.setItem('beldiFusionCart', JSON.stringify(cartItems));
}

// Notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.classList.add('notification');
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Smooth scroll for navigation links
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-links a, .footer-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const mobileNavLinks = document.querySelector('.nav-links');
                if (mobileNavLinks.classList.contains('active')) {
                    mobileNavLinks.classList.remove('active');
                    
                    const icon = document.querySelector('.mobile-menu-btn i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
                
                // Update active class in navigation
                document.querySelectorAll('.nav-links a').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
}

// Load Menu Items
function loadMenuItems() {
    // Sample menu data (in a real application, this would come from a database)
    const menuItems = [
        // Tajines
        {
            name: "Tajine de Poulet au Citron",
            price: "160 DH",
            description: "Traditional chicken tajine with preserved lemon and olives",
            category: "tajines",
            image: "imgs/tajine-de-poulet-au-citron.jpg"
        },
        {
            name: "Tajine Mderbel",
            price: "175 DH",
            description: "Traditional beef tajine with caramelized onions",
            category: "tajines",
            image: "imgs/tajine-mderbel.jpg"
        },
        {
            name: "Tajine Kefta BMK",
            price: "145 DH",
            description: "Spiced meatballs in tomato sauce with egg",
            category: "tajines",
            image: "imgs/tajine-kefta-bmk.jpg"
        },
        {
            name: "Tajine de Boeuf aux Pruneaux",
            price: "185 DH",
            description: "Beef tajine with prunes and toasted almonds",
            category: "tajines",
            image: "imgs/tajine-de-boeuf-aux-pruneaux-et-aux-amandes-torrefiees.jpg"
        },
        {
            name: "Tajine de Boulettes de Sardines",
            price: "165 DH",
            description: "Sardine meatballs tajine with shrimps",
            category: "tajines",
            image: "imgs/tajine-de-boulettes-de-sardines-aux-crevettes.jpg"
        },
        {
            name: "Tajine Kebda Maghdour",
            price: "150 DH",
            description: "Traditional liver tajine with Moroccan spices",
            category: "tajines",
            image: "imgs/tajine-kebda-maghdour.jpg"
        },

        // Burgers & Sandwiches
        {
            name: "Beldi Cheese Burger",
            price: "125 DH",
            description: "Premium beef patty with melted cheese and special sauce",
            category: "burgers",
            image: "imgs/beldi-cheese-burger.jpg"
        },
        {
            name: "Chicken Burger Korean Style",
            price: "130 DH",
            description: "Crispy chicken with Korean glaze and pickled vegetables",
            category: "burgers",
            image: "imgs/chicken-burger-korean-style.jpg"
        },
        {
            name: "Burger Tower",
            price: "155 DH",
            description: "Double beef patty with cheese, bacon and special sauce",
            category: "burgers",
            image: "imgs/burger-tower.jpg"
        },
        {
            name: "Burger Batbout au Poulet Grillé",
            price: "120 DH",
            description: "Grilled chicken in traditional Moroccan bread",
            category: "burgers",
            image: "imgs/burger-batbout-au-poulet-grilee.jpg"
        },
        {
            name: "Trio de Tacos Mexicains Poulet",
            price: "115 DH",
            description: "Three Mexican-style chicken tacos with fresh toppings",
            category: "burgers",
            image: "imgs/trio-de-tacos-mexicains-poulet.jpg"
        },
        {
            name: "Trio de Tacos Mexicains Gambas",
            price: "135 DH",
            description: "Three Mexican-style shrimp tacos with fresh toppings",
            category: "burgers",
            image: "imgs/trio-de-tacos-mexicains-gambas.jpg"
        },
        {
            name: "Batbout Poulet Grillé",
            price: "110 DH",
            description: "Moroccan bread filled with grilled chicken and vegetables",
            category: "burgers",
            image: "imgs/batbout-poulet-grille.jpg"
        },
        {
            name: "Batbout Poulet Crunchy",
            price: "115 DH",
            description: "Moroccan bread filled with crispy chicken and fresh vegetables",
            category: "burgers",
            image: "imgs/batbout-poulet-crunshy.jpg"
        },
        {
            name: "Batbout Veggie aux Falafels",
            price: "105 DH",
            description: "Veggie sandwich with falafels and tahini sauce",
            category: "burgers",
            image: "imgs/batbout-veggie-aux-fallafels.jpg"
        },
        {
            name: "Batbout Kefta Beldi",
            price: "110 DH",
            description: "Traditional Moroccan bread filled with spiced meatballs",
            category: "burgers",
            image: "imgs/batbout-kefta-beldi.jpg"
        },
        {
            name: "Batbout Gambas",
            price: "125 DH",
            description: "Moroccan bread sandwich with marinated shrimps",
            category: "burgers",
            image: "imgs/batbout-gambas.jpg"
        },
        {
            name: "Bocadillos Tangérios Thon et Crevette",
            price: "115 DH",
            description: "Sandwich with tuna and shrimp, Tangier style",
            category: "burgers",
            image: "imgs/bocadillos-tangerios-thon-et-crevette.jpg"
        },
        {
            name: "Master Thon Avocat",
            price: "120 DH",
            description: "Premium sandwich with tuna and avocado",
            category: "burgers",
            image: "imgs/master-thon-avocat.jpg"
        },

        // Main Dishes
        {
            name: "Mixed Grill",
            price: "220 DH",
            description: "Assortment of grilled meats with Moroccan spices",
            category: "main",
            image: "imgs/mixed-grill-1.jpg"
        },
        {
            name: "Brochettes de Poulet",
            price: "140 DH",
            description: "Grilled chicken skewers with vegetables",
            category: "main",
            image: "imgs/brochettes-de-poulet-1.jpg"
        },
        {
            name: "Brochettes Kefta",
            price: "135 DH",
            description: "Grilled beef meatball skewers with Moroccan spices",
            category: "main",
            image: "imgs/brochettes-kefta-1.jpg"
        },
        {
            name: "Brochette Wrap Kefta Royale",
            price: "145 DH",
            description: "Kefta skewers wrapped in thin bread with sauce",
            category: "main",
            image: "imgs/brochette-wrape-kefta-royale.jpg"
        },
        {
            name: "Boulfaf",
            price: "160 DH",
            description: "Traditional Moroccan grilled meat wrapped in fat",
            category: "main",
            image: "imgs/boulfaf.jpg"
        },
        {
            name: "Supreme de Poulet à la Crème de Champignons",
            price: "170 DH",
            description: "Chicken supreme with mushroom cream sauce",
            category: "main",
            image: "imgs/supreme-de-poulet-a-la-creme-de-champignons.jpg"
        },
        {
            name: "Émincé de Poulet à la Crème aux Champignons",
            price: "160 DH",
            description: "Sliced chicken with mushroom cream sauce",
            category: "main",
            image: "imgs/emince-de-poulet-a-la-creme-aux-champignons.jpg"
        },
        {
            name: "Émincé de Boeuf",
            price: "175 DH",
            description: "Sliced beef with chef's special sauce",
            category: "main",
            image: "imgs/emince-de-boeuf-1.jpg"
        },
        {
            name: "Cordon Bleu aux Légumes de Saison",
            price: "155 DH",
            description: "Chicken cordon bleu with seasonal vegetables",
            category: "main",
            image: "imgs/cordon-bleu-aux-legumes-de-saison-1.jpg"
        },
        {
            name: "Poisson Blanc aux Champignons",
            price: "180 DH",
            description: "White fish with mushrooms and shrimp coulis",
            category: "main",
            image: "imgs/poisson-blanc-du-jour-aux-champignons-coulis-de-crevettes-1.jpg"
        },
        {
            name: "Kabsa au Poulet",
            price: "165 DH",
            description: "Arabic rice dish with spiced chicken",
            category: "main",
            image: "imgs/kabsa-au-poulet-1.jpg"
        },
        {
            name: "Djaj Mhemer",
            price: "175 DH",
            description: "Roasted chicken with Moroccan spices",
            category: "main",
            image: "imgs/djaj-mhemer.jpg"
        },
        {
            name: "Rfissa au Poulet Beldi",
            price: "165 DH",
            description: "Traditional Moroccan dish with shredded pancakes and chicken",
            category: "main",
            image: "imgs/rfissa-au-poulet-beldi-galette-de-farine-complete.jpg"
        },
        {
            name: "Tanjia de Jarret de Boeuf",
            price: "195 DH",
            description: "Slow-cooked beef shank in traditional clay pot",
            category: "main",
            image: "imgs/tanjia-de-jarret-de-boeuf-melj-1.jpg"
        },
        {
            name: "Hargma Pieds de Veaux aux Pois Chiches",
            price: "175 DH",
            description: "Calf's feet with chickpeas in flavorful sauce",
            category: "main",
            image: "imgs/hargma-pieds-de-veaux-aux-pois-chiches.jpg"
        },
        {
            name: "Tqalia Abats",
            price: "165 DH",
            description: "Traditional offal dish with spices",
            category: "main",
            image: "imgs/tqalia-abats-1.jpg"
        },
        {
            name: "Seffa Madfouna",
            price: "150 DH",
            description: "Vermicelli with chicken, raisins and almonds",
            category: "main",
            image: "imgs/seffa-madfouna-cheveux-dange-au-poulet-1.jpg"
        },
        {
            name: "Beldi Bled",
            price: "175 DH",
            description: "Traditional Moroccan dish with local ingredients",
            category: "main",
            image: "imgs/beldi-bled.jpg"
        },
        
        // Pasta
        {
            name: "Arrabiata",
            price: "120 DH",
            description: "Spicy tomato sauce pasta with garlic and chili",
            category: "pasta",
            image: "imgs/arrabiata-1.jpg"
        },
        {
            name: "Bolognaise",
            price: "135 DH",
            description: "Classic pasta with beef and tomato sauce",
            category: "pasta",
            image: "imgs/bolognaise-1.jpg"
        },
        {
            name: "Fruits de Mer",
            price: "155 DH",
            description: "Seafood pasta with cream sauce",
            category: "pasta",
            image: "imgs/fruits-de-mer-2.jpg"
        },
        {
            name: "Saumon",
            price: "160 DH",
            description: "Pasta with salmon in a creamy dill sauce",
            category: "pasta",
            image: "imgs/saumon-1.jpg"
        },

        // Starters
        {
            name: "Pastilla au Poulet",
            price: "125 DH",
            description: "Sweet and savory chicken pie with almonds and cinnamon",
            category: "starters",
            image: "imgs/pastila-au-poulet.jpg"
        },
        {
            name: "Assortiment de Briouates",
            price: "110 DH",
            description: "Mixed Moroccan pastry filled with meat, cheese and vegetables",
            category: "starters",
            image: "imgs/assortiment-de-briouates.jpg"
        },
        {
            name: "Velouté de Légumes",
            price: "85 DH",
            description: "Creamy vegetable soup with fresh herbs",
            category: "starters",
            image: "imgs/veloute-de-legumes.jpg"
        },
        {
            name: "Mezze Libanais",
            price: "135 DH",
            description: "Assortment of Lebanese appetizers",
            category: "starters",
            image: "imgs/mezze-libanais-2.jpg"
        },
        {
            name: "Houmous Poulet",
            price: "105 DH",
            description: "Creamy chickpea dip with grilled chicken topping",
            category: "starters",
            image: "imgs/houmous-poulet.jpg"
        },
        {
            name: "Assortiment de Salades Marocaines",
            price: "120 DH",
            description: "Selection of traditional Moroccan salads",
            category: "starters",
            image: "imgs/assortiment-de-salades-marocaines-1.jpg"
        },
        {
            name: "Croquettes de Tajine de Poulet",
            price: "95 DH",
            description: "Chicken tajine croquettes with citrus flavor",
            category: "starters",
            image: "imgs/croquettes-de-tajine-de-poulet-au-citron.jpg"
        },
        {
            name: "Croustillant de Gambas",
            price: "125 DH",
            description: "Crispy shrimp with tartare sauce",
            category: "starters",
            image: "imgs/croustillant-de-gambas-sauce-tartare.jpg"
        },
        {
            name: "Pastilla Jouhara",
            price: "130 DH",
            description: "Jewel pastilla with special filling",
            category: "starters",
            image: "imgs/pastilla-jouhara.jpg"
        },

        // Salads
        {
            name: "Salade Buratta",
            price: "125 DH",
            description: "Fresh buratta cheese with tomatoes and basil",
            category: "salads",
            image: "imgs/salade-buratta.jpg"
        },
        {
            name: "Salade Meli Melo",
            price: "95 DH",
            description: "Mixed salad with house dressing",
            category: "salads",
            image: "imgs/salade-meli-melo-2.jpg"
        },
        {
            name: "Salade Niçoise",
            price: "110 DH",
            description: "Classic French salad with tuna, eggs, and olives",
            category: "salads",
            image: "imgs/salade-nicoise-1.jpg"
        },
        {
            name: "Salade Tomate Thon Oignon",
            price: "95 DH",
            description: "Fresh tomato salad with tuna and onions",
            category: "salads",
            image: "imgs/salade-tomate-thon-oignon.jpg"
        },
        {
            name: "Salade Avocat aux Crevettes",
            price: "130 DH",
            description: "Avocado salad with shrimp and citrus dressing",
            category: "salads",
            image: "imgs/salade-avocat-aux-crevettes-2.jpg"
        },
        {
            name: "Salade BFK Royale",
            price: "135 DH",
            description: "House special salad with premium ingredients",
            category: "salads",
            image: "imgs/salade-bfk-royale.jpg"
        },

        // Sushi
        {
            name: "Mixte Box (40 pieces)",
            price: "390 DH",
            description: "Assortment of fresh and fried sushi rolls",
            category: "sushi",
            image: "imgs/mixte-box-40-pieces.jpg"
        },
        {
            name: "Cru Box (40 pieces)",
            price: "420 DH",
            description: "40 pieces of fresh raw fish sushi",
            category: "sushi",
            image: "imgs/cru-box-40-pieces.jpg"
        },
        {
            name: "Fry Box (40 pieces)",
            price: "370 DH",
            description: "40 pieces of fried sushi rolls",
            category: "sushi",
            image: "imgs/fry-box-40-pieces.jpg"
        },
        {
            name: "Mixte Box (24 pieces)",
            price: "250 DH",
            description: "24 pieces of mixed sushi",
            category: "sushi",
            image: "imgs/mixte-box-24-pieces.jpg"
        },
        {
            name: "Cru Box (24 pieces)",
            price: "270 DH",
            description: "24 pieces of fresh raw fish sushi",
            category: "sushi",
            image: "imgs/cru-box-24-pieces.jpg"
        },
        {
            name: "Fry Box (24 pieces)",
            price: "240 DH",
            description: "24 pieces of fried sushi rolls",
            category: "sushi",
            image: "imgs/fry-box-24-pieces.jpg"
        },
        {
            name: "Mixte Box (16 pieces)",
            price: "190 DH",
            description: "16 pieces of mixed sushi",
            category: "sushi",
            image: "imgs/mixte-box-16-pieces.jpg"
        },
        {
            name: "Cru Box (16 pieces)",
            price: "210 DH",
            description: "16 pieces of fresh raw fish sushi",
            category: "sushi",
            image: "imgs/cru-box-16-piecs.jpg"
        },
        {
            name: "Fry Box (16 pieces)",
            price: "180 DH",
            description: "16 pieces of fried sushi rolls",
            category: "sushi",
            image: "imgs/fry-box-16-pieces.jpg"
        },
        {
            name: "Chirashi Saumon",
            price: "170 DH",
            description: "Rice bowl topped with fresh salmon sashimi",
            category: "sushi",
            image: "imgs/chirashi-saumon.jpg"
        },
        {
            name: "Chirashi Gambas",
            price: "180 DH",
            description: "Rice bowl topped with fresh shrimp",
            category: "sushi",
            image: "imgs/chirashi-gambas.jpg"
        },

        // Desserts
        {
            name: "Fondant au Chocolat",
            price: "85 DH",
            description: "Warm chocolate fondant with vanilla ice cream",
            category: "desserts",
            image: "imgs/fondant-chocolat-glace-vanille-1.jpg"
        },
        {
            name: "Brownie au Chocolat",
            price: "75 DH",
            description: "Rich chocolate brownie with nuts",
            category: "desserts",
            image: "imgs/brownie-au-chocolat-bfk.jpg"
        },
        {
            name: "Brownies Cheesecake Pistache Tiramisu",
            price: "95 DH",
            description: "Assorted dessert sampler with brownies, cheesecake, pistachio and tiramisu",
            category: "desserts",
            image: "imgs/brownies-cheesecake-pistache-tiramisu.jpg"
        },
        {
            name: "Salade de Fruits",
            price: "65 DH",
            description: "Fresh seasonal fruit salad",
            category: "desserts",
            image: "imgs/salade-de-fruits-1.jpg"
        },
        {
            name: "Crêpe Chocolat Dubai Glace Vanille",
            price: "85 DH",
            description: "Dubai-style chocolate crepe with vanilla ice cream",
            category: "desserts",
            image: "imgs/crepe-chocolat-dubai-glace-vanille.jpg"
        },
        {
            name: "Crêpe Oreo",
            price: "80 DH",
            description: "Crepe with Oreo cookies and chocolate sauce",
            category: "desserts",
            image: "imgs/crepe-oreo-1.jpg"
        },
        {
            name: "Crêpe Fruits Rouges",
            price: "85 DH",
            description: "Crepe with red berries and caramel or chocolate",
            category: "desserts",
            image: "imgs/crepe-fruits-rouges-caramel-ou-chocolat-1.jpg"
        },
        {
            name: "Dubai Chocolat Croissant",
            price: "90 DH",
            description: "Special chocolate-filled croissant, Dubai style",
            category: "desserts",
            image: "imgs/dubai-chocolat-croissant.jpg"
        },
        {
            name: "Pancake Chocolat",
            price: "75 DH",
            description: "Fluffy pancakes with chocolate sauce",
            category: "desserts",
            image: "imgs/pancake-chocolat-1.jpg"
        },
        {
            name: "Gaufre Chocolat Fruits Rouges",
            price: "85 DH",
            description: "Waffle with chocolate and red berries",
            category: "desserts",
            image: "imgs/gaufre-chocolat-fruits-rouges.jpg"
        },
        {
            name: "Gaufre Amlou Fruits Secs",
            price: "90 DH",
            description: "Waffle with amlou (almond butter) and dried fruits",
            category: "desserts",
            image: "imgs/gaufre-amlou-fruits-secs.jpg"
        },
        {
            name: "Macaron Géant aux Framboises",
            price: "95 DH",
            description: "Giant raspberry macaron",
            category: "desserts",
            image: "imgs/macaron-geant-aux-framboises.jpg"
        },
        {
            name: "Churros",
            price: "70 DH",
            description: "Fried dough pastry with chocolate dipping sauce",
            category: "desserts",
            image: "imgs/churros.jpg"
        },
        {
            name: "Chia Passion",
            price: "75 DH",
            description: "Chia seed pudding with passion fruit",
            category: "desserts",
            image: "imgs/chia-passion.jpg"
        },

        // Smoothies
        {
            name: "Smoothie Rainbow",
            price: "65 DH",
            description: "Blend of seasonal fruits with yogurt",
            category: "smoothies",
            image: "imgs/smoothie-rainbow.jpg"
        },
        {
            name: "Smoothie Banane Fraise",
            price: "65 DH",
            description: "Banana and strawberry smoothie",
            category: "smoothies",
            image: "imgs/smoothie-banane-fraise.jpg"
        },
        {
            name: "Smoothie Fruits Rouges",
            price: "65 DH",
            description: "Red berries smoothie",
            category: "smoothies",
            image: "imgs/smoothie-fruits-rouges.jpg"
        },
        {
            name: "Smoothie Fusion Lover",
            price: "70 DH",
            description: "Special house blend smoothie",
            category: "smoothies",
            image: "imgs/smoothie-fusion-lover.jpg"
        },
        {
            name: "Smoothie Hawaiian Crush",
            price: "70 DH",
            description: "Tropical fruits smoothie with pineapple",
            category: "smoothies",
            image: "imgs/smoothie-hawain-crush.jpg"
        },
        {
            name: "Smoothie Mango Colada",
            price: "70 DH",
            description: "Mango and coconut smoothie",
            category: "smoothies",
            image: "imgs/smoothie-mango-colada.jpg"
        },
        {
            name: "Milkshake Vanille",
            price: "60 DH",
            description: "Creamy vanilla milkshake",
            category: "smoothies",
            image: "imgs/milkshake-vanille-1.jpg"
        },

        // Fresh Juices
        {
            name: "Jus d'Avocat",
            price: "70 DH",
            description: "Fresh avocado juice with milk and honey",
            category: "juices",
            image: "imgs/jus-davocat.jpg"
        },
        {
            name: "Jus d'Avocat Fruits Secs",
            price: "75 DH",
            description: "Avocado juice with dried fruits",
            category: "juices",
            image: "imgs/jus-davocat-fruits-secs.jpg"
        },
        {
            name: "Jus d'Orange",
            price: "50 DH",
            description: "Freshly squeezed orange juice",
            category: "juices",
            image: "imgs/jus-dorange.jpg"
        },
        {
            name: "Jus de Banane",
            price: "55 DH",
            description: "Fresh banana juice with milk",
            category: "juices",
            image: "imgs/jus-de-banane.jpg"
        },
        {
            name: "Jus de Carotte",
            price: "50 DH",
            description: "Fresh carrot juice",
            category: "juices",
            image: "imgs/jus-de-carotte.jpg"
        },
        {
            name: "Citronnade",
            price: "45 DH",
            description: "Homemade lemonade",
            category: "juices",
            image: "imgs/citronnade.jpg"
        },
        {
            name: "Panaché Fruits Saison",
            price: "65 DH",
            description: "Mixed seasonal fruits juice",
            category: "juices",
            image: "imgs/panache-fruits-saisons.jpg"
        },

        // Special Drinks
        {
            name: "Cocktail Paradis",
            price: "70 DH",
            description: "Refreshing non-alcoholic fruit cocktail",
            category: "drinks",
            image: "imgs/cocktail-paradis.jpg"
        },
        {
            name: "Fruits du Soleil",
            price: "70 DH",
            description: "Sunny blend of citrus and tropical fruits",
            category: "drinks",
            image: "imgs/frtuits-du-soleil.jpg"
        },
        {
            name: "Mango Dragon Sunrise",
            price: "75 DH",
            description: "Mango and dragon fruit blend",
            category: "drinks",
            image: "imgs/mango-dragon-sunrise.jpg"
        },
        {
            name: "Kaki Papaye Fusion",
            price: "72 DH",
            description: "Blend of persimmon and papaya",
            category: "drinks",
            image: "imgs/kaki-papaye-fusion.jpg"
        },
        {
            name: "Marrakech One",
            price: "65 DH",
            description: "Signature Marrakech drink with local fruits",
            category: "drinks",
            image: "imgs/marrakech-one.jpg"
        }
    ];
    
    const menuItemsContainer = document.getElementById('menu-items-container');
    
    if (menuItemsContainer) {
        menuItems.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.classList.add('menu-item', 'dish-card');
            menuItemElement.dataset.category = item.category;
            
            menuItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="dish-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="dish-footer">
                        <span class="price">${item.price}</span>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                </div>
            `;
            
            menuItemsContainer.appendChild(menuItemElement);
        });
        
        // Reinitialize cart functionality for the dynamically added items
        initCartFunctionality();
    }
    
    // Initialize cart count and items from localStorage
    renderCartItems();
    updateCartCount();
    updateCartTotal();
} 