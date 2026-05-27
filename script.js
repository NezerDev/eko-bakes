/**
 * EKO BAKES - Enhanced 3D JavaScript with Physics
 * Strict separation of concerns: JavaScript handles behavior via class toggling
 * All styling is managed in CSS
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // 1. MOBILE MENU LOGIC
    // ============================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    // Ensure menu starts in correct state
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target)) {
                mobileMenu.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // ============================================
    // 2. CART STATE MANAGEMENT
    // ============================================
    let cart = [];

    const cartCountElement = document.getElementById('cart-count');
    const floatingCart = document.getElementById('floating-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalDisplay = document.getElementById('cart-total-display');
    const whatsappBtn = document.getElementById('whatsapp-checkout-btn');
    const closeCartBtn = document.getElementById('close-cart');

    // ============================================
    // 3. ADD TO CART FUNCTIONALITY
    // ============================================
    document.querySelectorAll('.product-card').forEach(card => {
        const button = card.querySelector('.add-to-cart-btn');
        const heading = card.querySelector('h4');
        
        if (!heading) return;

        const title = heading.innerText;
        const priceText = card.querySelector('.price').innerText;
        const price = parseFloat(priceText.replace(/[^\d.-]/g, ''));

        button.addEventListener('click', () => {
            // Add item to cart
            cart.push({ title, price });
            updateCartUI();

            // Animate button feedback
            button.classList.add('added');
            button.innerText = "Added!";

            // Animate floating cart
            floatingCart.style.animation = 'none';
            setTimeout(() => {
                floatingCart.style.animation = 'cartPulse 0.3s ease';
            }, 10);

            // Reset button after 1 second
            setTimeout(() => {
                button.classList.remove('added');
                button.innerText = "Add to Cart";
            }, 1000);
        });
    });

    // Update cart UI
    function updateCartUI() {
        cartCountElement.innerText = cart.length;
        cartItemsList.innerHTML = "";
        let total = 0;

        cart.forEach((item) => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.title}</span>
                <span>₦${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            `;
            cartItemsList.appendChild(div);
        });

        cartTotalDisplay.innerText = `₦${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    // ============================================
    // 4. CART OVERLAY MANAGEMENT
    // ============================================
    floatingCart.addEventListener('click', () => {
        cartOverlay.classList.add('active');
    });

    closeCartBtn.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
    });

    // Close cart when clicking outside the modal
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
            cartOverlay.classList.remove('active');
        }
    });

    // ============================================
    // 5. WHATSAPP CHECKOUT
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

        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    });

    // ============================================
    // 6. SEARCH FILTER
    // ============================================
    const searchBar = document.querySelector('.search-bar');
    const productCards = document.querySelectorAll('.product-card');

    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            productCards.forEach((card) => {
                const heading = card.querySelector('h4');
                if (!heading) return;

                const productName = heading.innerText.toLowerCase();
                const isVisible = productName.includes(searchTerm);
                
                card.style.display = isVisible ? "" : "none";
                card.style.opacity = isVisible ? "1" : "0";
            });
        });
    }

    // ============================================
    // 7. CATEGORY FILTERING
    // ============================================
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button state
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter products
            const filterValue = btn.getAttribute('data-filter');
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const isVisible = filterValue === 'all' || cardCategory === filterValue;
                
                card.style.display = isVisible ? "" : "none";
                card.style.opacity = isVisible ? "1" : "0";
            });
        });
    });

    // ============================================
    // 8. ENHANCED 3D PARALLAX SCROLL EFFECT WITH PHYSICS
    // ============================================
    const parallaxItems = document.querySelectorAll('.parallax-item');
    const parallaxState = {};

    // Initialize parallax state for each item
    parallaxItems.forEach((item, index) => {
        parallaxState[index] = {
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            velocity: 0,
            targetRotationX: 0,
            targetRotationY: 0,
            targetRotationZ: 0
        };
    });

    // Add CSS animation for cart pulse and floating
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cartPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);

    // Add subtle floating animation to parallax items
    parallaxItems.forEach((item, index) => {
        item.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
    });

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const maxScroll = document.documentElement.scrollHeight - windowHeight;
            const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;

            parallaxItems.forEach((item, index) => {
                const speed = parseFloat(item.getAttribute('data-speed'));
                const rotationSpeed = parseFloat(item.getAttribute('data-rotation'));
                const depth = parseFloat(item.getAttribute('data-depth')) || 1;
                const state = parallaxState[index];

                // Calculate parallax effect with easing
                const yPos = scrollY * speed;
                const rotation = scrollY * rotationSpeed;

                // Calculate perspective depth effect with wave animation
                const perspectiveZ = depth * 80 + (Math.sin(scrollPercent * Math.PI * 2) * 30);

                // Advanced 3D transforms with smooth easing
                state.targetRotationX = rotation * 0.8 + (Math.sin(scrollY * 0.005 + index) * 15);
                state.targetRotationY = rotation * 0.5 + (Math.cos(scrollY * 0.003 + index) * 20);
                state.targetRotationZ = rotation * 1.2;

                // Smooth interpolation for natural motion (easing)
                state.rotationX += (state.targetRotationX - state.rotationX) * 0.08;
                state.rotationY += (state.targetRotationY - state.rotationY) * 0.08;
                state.rotationZ += (state.targetRotationZ - state.rotationZ) * 0.08;

                // Enhanced 3D transform with smooth physics
                item.style.transform = `
                    translate3d(0px, ${yPos}px, ${perspectiveZ}px) 
                    rotateX(${state.rotationX}deg) 
                    rotateY(${state.rotationY}deg) 
                    rotateZ(${state.rotationZ}deg)
                    scale(${0.9 + Math.sin(scrollPercent * Math.PI * 2) * 0.1})
                `;

                // Dynamic opacity with depth perception
                const opacity = 0.75 + (Math.sin(scrollY * 0.008 + index) * 0.15);
                item.style.opacity = Math.max(0.4, Math.min(1, opacity));
            });
        });
    });

    // ============================================
    // 9. ADVANCED MOUSE MOVEMENT PARALLAX WITH 3D DEPTH
    // ============================================
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) - 0.5;
        targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    // Smooth mouse tracking with easing (60fps)
    setInterval(() => {
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;

        parallaxItems.forEach((item, index) => {
            const depth = parseFloat(item.getAttribute('data-depth')) || 1;
            const moveX = mouseX * depth * 40;
            const moveY = mouseY * depth * 40;
            const tiltX = mouseY * depth * 5;
            const tiltY = mouseX * depth * 5;

            // Get current transform and enhance with mouse movement
            const currentTransform = item.style.transform;
            
            // Extract translate3d values
            const translateMatch = currentTransform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            
            if (translateMatch) {
                const baseZ = translateMatch[3].trim();
                
                // Create new transform with mouse movement applied
                let newTransform = currentTransform
                    .replace(/translate3d\([^)]+\)/, `translate3d(${moveX}px, ${moveY}px, ${baseZ})`)
                    .replace(/rotateX\([^)]+\)/, `rotateX(${tiltX}deg)`)
                    .replace(/rotateY\([^)]+\)/, `rotateY(${tiltY}deg)`);
                
                item.style.transform = newTransform;
            }
        });
    }, 16); // ~60fps
});
