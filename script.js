document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Mobile Menu Logic ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    mobileMenu.addEventListener('click', () => {
        navLinks.style.display = (navLinks.style.display === 'flex') ? 'none' : 'flex';
        if(navLinks.style.display === 'flex') {
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(253, 251, 247, 0.98)';
            navLinks.style.padding = '1rem 0';
            navLinks.style.textAlign = 'center';
        }
    });

    // --- 2. Enhanced Cart Logic ---
    let cart = [];
    const cartCountElement = document.getElementById('cart-count');
    const floatingCart = document.getElementById('floating-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalDisplay = document.getElementById('cart-total-display');
    const whatsappBtn = document.getElementById('whatsapp-checkout-btn');

    // Add to Cart Function
    document.querySelectorAll('.product-card').forEach(card => {
        const button = card.querySelector('.add-to-cart-btn');
        const heading = card.querySelector('h4');
        if (!heading) return;
        
        const title = heading.innerText;
        const priceText = card.querySelector('.price').innerText;
        const price = parseFloat(priceText.replace(/[^\d.-]/g, ''));

        button.addEventListener('click', () => {
            cart.push({ title, price });
            updateCartUI();

            // Premium Button Animation
            button.innerText = "Added!";
            button.style.backgroundColor = "#1E1A17"; 
            button.style.color = "#fff";
            
            floatingCart.style.transform = "scale(1.2)";
            setTimeout(() => { floatingCart.style.transform = "scale(1)"; }, 200);
            setTimeout(() => {
                button.innerText = "Add to Cart";
                button.style.backgroundColor = "transparent";
                button.style.color = "#3A2C23";
            }, 1000);
        });
    });

    function updateCartUI() {
        cartCountElement.innerText = cart.length;
        cartItemsList.innerHTML = "";
        let total = 0;

        cart.forEach((item) => {
            total += item.price;
            const div = document.createElement('div');
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.marginBottom = "10px";
            div.innerHTML = `<span>${item.title}</span> <span>₦${item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>`;
            cartItemsList.appendChild(div);
        });
        cartTotalDisplay.innerText = `₦${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    }

    floatingCart.addEventListener('click', () => cartOverlay.style.display = 'block');
    document.getElementById('close-cart').addEventListener('click', () => cartOverlay.style.display = 'none');

    // --- 3. WhatsApp Redirect ---
    whatsappBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert("Your cart is empty!");
        const phoneNumber = "2348029405289"; 
        let message = "Hello! I'd like to place an order from the Eko Bakes menu:\n\n";
        
        cart.forEach((item, i) => {
            message += `${i + 1}. ${item.title} - ₦${item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}\n`;
        });
        message += `\n*Total: ${cartTotalDisplay.innerText}*`;
        message += `\n\nIs this available?`;

        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    });

    // --- 4. Instant Search Filter ---
    const searchBar = document.querySelector('.search-bar');
    const productCards = document.querySelectorAll('.product-card');

    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            productCards.forEach((card) => {
                const heading = card.querySelector('h4');
                if (!heading) return;

                const productName = heading.innerText.toLowerCase();
                if (productName.includes(searchTerm)) {
                    card.style.display = ""; 
                    card.style.opacity = "1";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // --- 5. Premium Category Tab Filter ---
    const categoryButtons = document.querySelectorAll('.category-btn');
    if (categoryButtons) {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => {
                    b.style.background = "transparent";
                    b.style.color = "#1E1A17";
                });
                btn.style.background = "#1E1A17";
                btn.style.color = "#fff";
                
                const filterValue = btn.getAttribute('data-filter');
                productCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (filterValue === 'all' || cardCategory === filterValue) {
                        card.style.display = "";
                        card.style.opacity = "1";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }
});
