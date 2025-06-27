let isLoggedIn = false;
    let cart = [];
    let currentOrder = null;

    // Modal functions
    function openModal() {
        document.getElementById('loginModal').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('loginModal').style.display = 'none';
    }

    function openCart() {
        updateCartDisplay();
        document.getElementById('cartModal').style.display = 'block';
    }

    function closeCart() {
        document.getElementById('cartModal').style.display = 'none';
    }

    function openOrderModal(items, isDirectOrder = false) {
        currentOrder = { items, isDirectOrder };
        updateOrderSummary();
        document.getElementById('orderModal').style.display = 'block';
    }

    function closeOrderModal() {
        document.getElementById('orderModal').style.display = 'none';
        currentOrder = null;
    }

    // Login/Register
    function handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            isLoggedIn = true;
            closeModal();
            document.getElementById('navLinks').classList.remove('hidden');
            document.getElementById('cartBtn').style.display = 'block';
            document.getElementById('registerBtn').style.display = 'none';

            const loginBtn = document.getElementById('loginBtn');
            loginBtn.textContent = 'Keluar';
            loginBtn.onclick = logout;

            alert('Login berhasil!');
        }
    }

    function openRegisterModal() {
        document.getElementById('registerModal').style.display = 'block';
    }

    function closeRegisterModal() {
        document.getElementById('registerModal').style.display = 'none';
    }

    function logout() {
        isLoggedIn = false;
        cart = [];
        document.getElementById('navLinks').classList.add('hidden');
        document.getElementById('cartBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'inline-block';
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.textContent = 'Login';
        loginBtn.onclick = openModal;
        showPage('home');
        updateCartCount();
        alert('Anda telah logout');
    }

    // Cart
    function addToCart(name, price, icon) {
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu');
            return;
        }

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, icon, quantity: 1 });
        }
        updateCartCount();
    }

    function buyNow(name, price, icon) {
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu');
            return;
        }

        const item = { name, price, icon, quantity: 1 };
        openOrderModal([item], true);
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartCount();
        updateCartDisplay();
    }

    function updateQuantity(index, change) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) removeFromCart(index);
        else updateCartDisplay();
    }

    function updateCartCount() {
        const count = cart.reduce((t, i) => t + i.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    }

    function updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Keranjang kosong</div>';
            cartTotal.style.display = 'none';
            checkoutBtn.style.display = 'none';
            return;
        }

        let total = 0;
        cartItems.innerHTML = cart.map((item, i) => {
            let sub = item.price * item.quantity;
            total += sub;
            return `
                <div class="cart-item">
                 <div class="cart-item-icon">${item.icon}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">Rp ${item.price.toLocaleString()}</div>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="updateQuantity(${i}, -1)">-</button>
                            <span style="margin: 0 1rem;">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${i}, 1)">+</button>
                            <button class="remove-btn" onclick="removeFromCart(${i})">Hapus</button>
                        </div>
                    </div>
                </div>`;
        }).join('');

        document.getElementById('totalAmount').textContent = total.toLocaleString();
        cartTotal.style.display = 'block';
        checkoutBtn.style.display = 'block';
    }

    function proceedToCheckout() {
        if (cart.length === 0) return;
        closeCart();
        openOrderModal([...cart]);
    }

    // Order
    function updateOrderSummary() {
        if (!currentOrder) return;
        const orderSummary = document.getElementById('orderSummary');
        let subtotal = 0;

        orderSummary.innerHTML = currentOrder.items.map(item => {
            let total = item.price * item.quantity;
            subtotal += total;
            return `
                <div class="cart-item">
                    <div class="cart-item img">${item.icon}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">Rp ${item.price.toLocaleString()} x ${item.quantity}</div>
                    </div>
                    <div style="font-weight:bold;">Rp ${total.toLocaleString()}</div>
                </div>`;
        }).join('');

        document.getElementById('orderSubtotal').textContent = subtotal.toLocaleString();
        updateShippingCost();
    }

    function updateShippingCost() {
    const biayaEkspedisi = {
        'jne': 25000,
        'pos': 12000,
        'jnt': 13000,
        'sicepat': 50000,
        'pickup': 0
    };

    const biayaZona = {
        'dalam': 0,
        'sekitar': 5000,
        'luar': 10000
    };

    const ekspedisi = document.getElementById('shippingMethod').value;
    const zona = document.getElementById('cityZone')?.value || 'dalam';

    const ongkir = (biayaEkspedisi[ekspedisi] || 0) + (biayaZona[zona] || 0);
    const subtotal = parseInt(document.getElementById('orderSubtotal').textContent.replace(/\./g, '').replace(/,/g, '')) || 0;
    const total = subtotal + ongkir;

    document.getElementById('shippingCost').textContent = ongkir.toLocaleString();
    document.getElementById('orderTotal').textContent = total.toLocaleString();
}


    function handleOrder(event) {
        event.preventDefault();
        const name = document.getElementById('customerName').value;
        const phone = document.getElementById('customerPhone').value;
        const address = document.getElementById('customerAddress').value;
        const payment = document.getElementById('paymentMethod').value;
        const shipping = document.getElementById('shippingMethod').value;
        const notes = document.getElementById('orderNotes').value;
        const total = document.getElementById('orderTotal').textContent;
        const items = currentOrder.items;
        const zone = document.getElementById('cityZone').value;  

        if (!name || !phone || !address) {
            alert('Harap lengkapi semua data.');
            return;
        }
    const id = 'AK' + Date.now().toString().slice(-6);
    const itemsText = items.map(i => `- ${i.name} (${i.quantity}x) = Rp ${(i.price * i.quantity).toLocaleString()}`).join('\n');

    const pesan = `*PESANAN BARU - ${id}*\n\n*Nama:* ${name}\n*Phone:* ${phone}\n*Alamat:* ${address}\n*Zona:* ${zone}\n\n${itemsText}\n\n*Bayar:* ${payment}\n*Kirim:* ${shipping}\n*Total:* Rp ${total}\n\n${notes ? '*Catatan:* ' + notes : ''}`;

    window.open(`https://wa.me/6282312893024?text=${encodeURIComponent(pesan)}`, '_blank');

        if (!currentOrder.isDirectOrder) {
            cart = [];
            updateCartCount();
        }

        closeOrderModal();
        event.target.reset();
    }

    function showPage(name) {
        if (!isLoggedIn && name !== 'home') {
            alert('Login dulu ya!');
            return;
        }

        ['homePage', 'aboutPage', 'productsPage', 'contactPage'].forEach(p => {
            const el = document.getElementById(p);
            if (el) el.style.display = 'none';
        });

        document.getElementById(name + 'Page').style.display = 'block';
    }

    window.onclick = function(event) {
        if (event.target === document.getElementById('loginModal')) closeModal();
        if (event.target === document.getElementById('registerModal')) closeRegisterModal();
        if (event.target === document.getElementById('cartModal')) closeCart();
        if (event.target === document.getElementById('orderModal')) closeOrderModal();
    }

    document.addEventListener('DOMContentLoaded', function () {
        showPage('home');
        document.getElementById('navLinks').classList.add('hidden');
        document.getElementById('cartBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'inline-block';
    });

// Login/Register with localStorage (overwrite existing functions)
function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
        alert('Username sudah terdaftar!');
        return;
    }

    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registrasi berhasil! Silakan login.');
    closeRegisterModal();
    event.target.reset();
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        isLoggedIn = true;
        closeModal();
        document.getElementById('navLinks').classList.remove('hidden');
        document.getElementById('cartBtn').style.display = 'block';
        document.getElementById('registerBtn').style.display = 'none';

        const loginBtn = document.getElementById('loginBtn');
        loginBtn.textContent = 'Keluar';
        loginBtn.onclick = logout;

        alert('Login berhasil!');
    } else {
        alert('Username atau password salah.');
    }
}