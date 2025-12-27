// Products are loaded from data.js globally

const STORAGE_KEY = 'shopping-list-app-state';

const state = {
    view: 'browse', // 'browse' or 'list'
    shoppingList: [],
    dismissed: new Set(),
};

const elements = {
    mainContent: document.getElementById('main-content'),
    navBrowse: document.getElementById('nav-browse'),
    navList: document.getElementById('nav-list'),
    listCounter: document.getElementById('list-counter'),
    navBadge: document.getElementById('nav-badge'),
    btnReset: document.getElementById('btn-reset'),
};

// Categories Order
const CATEGORY_ORDER = [
    "Fridge",
    "Fresh Produce",
    "Pantry",
    "Meat & Alt",
    "Freezer",
    "Household"
];

function init() {
    loadState();
    render();
    setupEventListeners();
}

function loadState() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            state.shoppingList = parsed.shoppingList || [];
            // Convert array back to Set
            state.dismissed = new Set(parsed.dismissed || []);

            // Re-hydrate shoppingList items from window.products to ensure data consistency?
            // Actually, storing full object is fine for now, but names are the key.
        } catch (e) {
            console.error('Failed to load state', e);
        }
    }
}

function saveState() {
    const toSave = {
        shoppingList: state.shoppingList,
        dismissed: Array.from(state.dismissed), // Convert Set to Array
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function setupEventListeners() {
    elements.navBrowse.addEventListener('click', () => {
        state.view = 'browse';
        updateNav();
        render();
    });

    elements.navList.addEventListener('click', () => {
        state.view = 'list';
        updateNav();
        render();
    });

    elements.btnReset.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all selections?')) {
            handleReset();
        }
    });
}

function updateNav() {
    if (state.view === 'browse') {
        elements.navBrowse.classList.add('active');
        elements.navList.classList.remove('active');
    } else {
        elements.navBrowse.classList.remove('active');
        elements.navList.classList.add('active');
    }
}

// Browse view shows all products now, not just "available" ones
function getAllProducts() {
    return window.products;
}

function render() {
    updateCounters();
    elements.mainContent.innerHTML = '';

    if (state.view === 'browse') {
        renderBrowseView();
    } else {
        renderListView();
    }
}

function updateCounters() {
    const count = state.shoppingList.length;
    elements.listCounter.textContent = `${count} items`;
    elements.listCounter.classList.toggle('hidden', count === 0);

    elements.navBadge.textContent = count;
    elements.navBadge.classList.toggle('hidden', count === 0);
}

function renderBrowseView() {
    const allProducts = getAllProducts();

    if (allProducts.length === 0) {
        elements.mainContent.innerHTML = '<div class="empty-state">All caught up! No more products.</div>';
        return;
    }

    // Group by category
    const grouped = allProducts.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
    }, {});

    // Render grouped sections
    // (CATEGORY_ORDER and other logic remains same, just ensuring we render everything)

    const categoriesToRender = [...new Set([...CATEGORY_ORDER, ...Object.keys(grouped)])];

    categoriesToRender.forEach(category => {
        if (grouped[category] && grouped[category].length > 0) {
            const section = document.createElement('div');
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category;
            section.appendChild(title);

            grouped[category].forEach(product => {
                const card = createProductCard(product, 'browse');
                section.appendChild(card);
            });

            elements.mainContent.appendChild(section);
        }
    });
}

function renderListView() {
    if (state.shoppingList.length === 0) {
        elements.mainContent.innerHTML = '<div class="empty-state">Your shopping list is empty.</div>';
        return;
    }

    const listContainer = document.createElement('div');
    listContainer.className = 'category-section'; // Reuse container style for rounded corners

    state.shoppingList.forEach((product, index) => {
        const card = createProductCard(product, 'list', index);
        listContainer.appendChild(card);
    });

    elements.mainContent.appendChild(listContainer);
}

function createProductCard(product, mode, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.name = product.name; // Identify for updates

    // Apply initial state classes
    if (state.dismissed.has(product.name)) {
        card.classList.add('dismissed');
    }
    if (state.shoppingList.some(p => p.name === product.name)) {
        card.classList.add('added');
    }

    const info = document.createElement('div');
    info.className = 'product-info';

    const nameLink = document.createElement('a');
    nameLink.className = 'product-name';
    nameLink.textContent = product.name;
    // Use Google "I'm Feeling Lucky" restricted to the site
    const query = `site:www.dunnesstoresgrocery.com ${product.name}`;
    nameLink.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`;
    nameLink.target = "_blank";

    // Price removed as per request
    // const price = document.createElement('div');
    // price.className = 'product-price';
    // price.textContent = product.price;

    info.appendChild(nameLink);
    // info.appendChild(price);

    const actions = document.createElement('div');
    actions.className = 'product-actions';

    if (mode === 'browse') {
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'btn btn-dismiss';
        dismissBtn.textContent = '✕'; // Compact icon/text
        dismissBtn.onclick = () => handleDismiss(product);

        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-add';
        addBtn.textContent = 'Add';
        addBtn.onclick = () => handleAdd(product);

        actions.appendChild(dismissBtn);
        actions.appendChild(addBtn);
    } else {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-remove';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => handleRemove(index);

        actions.appendChild(removeBtn);
    }

    card.appendChild(info);
    card.appendChild(actions);

    return card;
}

function handleDismiss(product) {
    if (state.dismissed.has(product.name)) {
        state.dismissed.delete(product.name);
    } else {
        state.dismissed.add(product.name);
        // If it was added, remove it?
        const listIndex = state.shoppingList.findIndex(p => p.name === product.name);
        if (listIndex > -1) {
            state.shoppingList.splice(listIndex, 1);
        }
    }
    saveState();
    render();
}

function handleAdd(product) {
    const listIndex = state.shoppingList.findIndex(p => p.name === product.name);

    if (listIndex > -1) {
        // Already added, remove it (toggle off)
        state.shoppingList.splice(listIndex, 1);
    } else {
        // Add it
        state.shoppingList.push(product);
        // If it was dismissed, undis-miss it
        if (state.dismissed.has(product.name)) {
            state.dismissed.delete(product.name);
        }
    }
    saveState();
    render();
}

function handleRemove(index) {
    state.shoppingList.splice(index, 1);
    saveState();
    render();
}

function handleReset() {
    state.shoppingList = [];
    state.dismissed.clear();
    saveState();
    render();
}

// Start app
init();
