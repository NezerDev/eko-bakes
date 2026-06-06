/**
 * EKO BAKES - Main Store Script
 * Products load from localStorage (set by manager dashboard)
 * Orders are logged to localStorage (viewed in manager dashboard)
 */

// ============================================
// PRODUCT DATA
// ============================================
const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Eko Signature Bread', price: 1500, category: 'bread',
      image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&q=80&w=400',
      alt: 'Fresh Loaf - Eko Signature Bread', inStock: true },
    { id: 2, name: 'Spicy Nigerian Meat Pie', price: 1200, category: 'pastries',
      image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=400',
      alt: 'Meat Pie - Spicy Nigerian Meat Pie', inStock: true },
    { id: 3, name: 'Crunchy Chin Chin Jar', price: 3000, category: 'pastries',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=400',
      alt: 'Chin Chin Jar - Crunchy Chin Chin Jar', inStock: true },
    { id: 4, name: 'Red Velvet Celebration Cake', price: 18000, category: 'cakes',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400',
      alt: 'Celebration Cake - Red Velvet Celebration Cake', inStock: true },
];

function getProducts() {
    try {
        const saved = localStorage.getItem('ekobakes_products');
        return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch {
        return DEFAULT_PRODUCTS;
    }
}

function logOrder(items, total) {
    try {
        const orders = JSON.parse(localStorage.getItem('ekobakes_orders') || '[]');
        orders.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            items: items.map(i => ({ name: i.title, price: i.price })),
            total
        });
        // Keep the last 100 orders only
        localStorage.setItem('ekobakes_orders', JSON.stringify(orders.slice(0, 100)));
    } catch {
        // Order logging is non-critical, fail silently
    }
}

// ============================================
// VISIT TRACKING
// ============================================
function logVisit() {
    try {
        // Only count once per browser session (prevents refresh inflation)
        if (sessionStorage.getItem('ekobakes_visit_logged')) return;
        sessionStorage.setItem('ekobakes_visit_logged', '1');

        const visits = JSON.parse(localStorage.getItem('ekobakes_visits') || '[]');
        visits.unshift({ timestamp: new Date().toISOString() });
        // Keep the last 500 visit records
        localStorage.setItem('ekobakes_visits', JSON.stringify(visits.slice(0, 500)));
    } catch {
        // Visit logging is non-critical, fail silently
    }
}

// ============================================
// MAIN INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {

    // Log this visit first
    logVisit();

    // ============================================
    // 1. MOBILE MENU LOGIC
    // ============================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // ============================================
    // 2. CART STATE
    // ============================================
    let cart = [];

    const cartCountElement = document.getElementById('cart-count');
    const floatingCart    = document.getElementById('floating-cart');
    const cartOverlay     = document.getElementById('cart-overlay');
    const cartItemsList   = document.getElementById('cart-items-list');
    const cartTotalDisplay = document.getElementById('cart-total-display');
    const whatsappBtn     = document.getElementById('whatsapp-checkout-btn');
    const closeCartBtn    = document.getElementById('close-cart');

    function updateCartUI() {
        cartCountElement.textContent = cart.length;
        cartItemsList.innerHTML = '';
        let total = 0;

        cart.forEach((item) => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';

            const titleSpan = document.createElement('span');
            titleSpan.textContent = item.title;

            const priceSpan = document.createElement('span');
            priceSpan.textContent = `₦${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

            div.appendChild(titleSpan);
            div.appendChild(priceSpan);
            cartItemsList.appendChild(div);
        });

        cartTotalDisplay.textContent = `₦${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    // ============================================
    // 3. RENDER PRODUCT GRID FROM DATA
    // ============================================
    const products    = getProducts();
    const productGrid = document.getElementById('product-grid');

    function renderProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card' + (product.inStock ? '' : ' out-of-stock');
        card.setAttribute('data-category', product.category);
        card.setAttribute('data-product-id', product.id);

        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.alt;
        img.loading = 'lazy';

        const info = document.createElement('div');
        info.className = 'product-info';

        if (!product.inStock) {
            const badge = document.createElement('div');
            badge.className = 'sold-out-badge';
            badge.textContent = 'Sold Out';
            card.appendChild(badge);
        }

        const title = document.createElement('h4');
        title.textContent = product.name;

        const priceEl = document.createElement('p');
        priceEl.className = 'price';
        priceEl.textContent = `₦${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        const btn = document.createElement('button');
        btn.className = 'add-to-cart-btn';

        if (!product.inStock) {
            btn.textContent = 'Out of Stock';
            btn.disabled = true;
            btn.classList.add('out-of-stock-btn');
        } else {
            btn.textContent = 'Add to Cart';
            btn.addEventListener('click', () => {
                cart.push({ title: product.name, price: product.price });
                updateCartUI();

                btn.classList.add('added');
                btn.textContent = 'Added!';

                floatingCart.style.animation = 'none';
                setTimeout(() => {
                    floatingCart.style.animation = 'cartPulse 0.3s ease';
                }, 10);

                setTimeout(() => {
                    btn.classList.remove('added');
                    btn.textContent = 'Add to Cart';
                }, 1000);
            });
        }

        info.appendChild(title);
        info.appendChild(priceEl);
        info.appendChild(btn);
        card.appendChild(img);
        card.appendChild(info);
        return card;
    }

    if (productGrid) {
        products.forEach(product => productGrid.appendChild(renderProductCard(product)));
    }

    // ============================================
    // 4. CART OVERLAY
    // ============================================
    floatingCart.addEventListener('click', () => cartOverlay.classList.add('active'));
    closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) cartOverlay.classList.remove('active');
    });

    // ============================================
    // 5. WHATSAPP CHECKOUT + ORDER LOGGING
    // ============================================
    whatsappBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const phoneNumber = "2348029405289";
        let message = "Hello! I'd like to place an order from the Eko Bakes menu:\n\n";

        cart.forEach((item, i) => {
            message += `${i + 1}. ${item.title} - ₦${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`;
        });

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        message += `\n*Total: ₦${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}*`;
        message += `\n\nIs this available?`;

        // Log to localStorage for manager dashboard
        logOrder(cart, total);

        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    });

    // ============================================
    // 6. SEARCH FILTER
    // ============================================
    const searchBar = document.querySelector('.search-bar');

    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.product-card').forEach((card) => {
                const heading = card.querySelector('h4');
                if (!heading) return;
                const productName = heading.textContent.toLowerCase();
                const isVisible = productName.includes(searchTerm);
                card.style.display  = isVisible ? '' : 'none';
                card.style.opacity  = isVisible ? '1' : '0';
            });
        });
    }

    // ============================================
    // 7. CATEGORY FILTERING
    // ============================================
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            document.querySelectorAll('.product-card').forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const isVisible = filterValue === 'all' || cardCategory === filterValue;
                card.style.display = isVisible ? '' : 'none';
                card.style.opacity = isVisible ? '1' : '0';
            });
        });
    });

    // ============================================
    // 8. 3D PARALLAX SCROLL
    // ============================================
    const parallaxItems = document.querySelectorAll('.parallax-item');
    const parallaxState = {};

    parallaxItems.forEach((item, index) => {
        parallaxState[index] = {
            rotationX: 0, rotationY: 0, rotationZ: 0,
            targetRotationX: 0, targetRotationY: 0, targetRotationZ: 0
        };
        item.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
    });

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(() => {
            const scrollY      = window.scrollY;
            const windowHeight = window.innerHeight;
            const maxScroll    = document.documentElement.scrollHeight - windowHeight;
            const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;

            parallaxItems.forEach((item, index) => {
                const speed         = parseFloat(item.getAttribute('data-speed'));
                const rotationSpeed = parseFloat(item.getAttribute('data-rotation'));
                const depth         = parseFloat(item.getAttribute('data-depth')) || 1;
                const state         = parallaxState[index];

                const yPos         = scrollY * speed;
                const rotation     = scrollY * rotationSpeed;
                const perspectiveZ = depth * 80 + (Math.sin(scrollPercent * Math.PI * 2) * 30);

                state.targetRotationX = rotation * 0.8 + (Math.sin(scrollY * 0.005 + index) * 15);
                state.targetRotationY = rotation * 0.5 + (Math.cos(scrollY * 0.003 + index) * 20);
                state.targetRotationZ = rotation * 1.2;

                state.rotationX += (state.targetRotationX - state.rotationX) * 0.08;
                state.rotationY += (state.targetRotationY - state.rotationY) * 0.08;
                state.rotationZ += (state.targetRotationZ - state.rotationZ) * 0.08;

                item.style.transform = `
                    translate3d(0px, ${yPos}px, ${perspectiveZ}px)
                    rotateX(${state.rotationX}deg)
                    rotateY(${state.rotationY}deg)
                    rotateZ(${state.rotationZ}deg)
                    scale(${0.9 + Math.sin(scrollPercent * Math.PI * 2) * 0.1})
                `;

                const opacity = 0.75 + (Math.sin(scrollY * 0.008 + index) * 0.15);
                item.style.opacity = Math.max(0.4, Math.min(1, opacity));
            });
        });
    });

    // ============================================
    // 9. MOUSE PARALLAX
    // ============================================
    let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) - 0.5;
        targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    function animateMouseParallax() {
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;

        parallaxItems.forEach((item) => {
            const depth  = parseFloat(item.getAttribute('data-depth')) || 1;
            const moveX  = mouseX * depth * 40;
            const moveY  = mouseY * depth * 40;
            const tiltX  = mouseY * depth * 5;
            const tiltY  = mouseX * depth * 5;

            const currentTransform = item.style.transform;
            const translateMatch   = currentTransform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);

            if (translateMatch) {
                const baseZ = translateMatch[3].trim();
                const newTransform = currentTransform
                    .replace(/translate3d\([^)]+\)/, `translate3d(${moveX}px, ${moveY}px, ${baseZ})`)
                    .replace(/rotateX\([^)]+\)/, `rotateX(${tiltX}deg)`)
                    .replace(/rotateY\([^)]+\)/, `rotateY(${tiltY}deg)`);
                item.style.transform = newTransform;
            }
        });

        requestAnimationFrame(animateMouseParallax);
    }
    requestAnimationFrame(animateMouseParallax);
});
