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

// Preferred display order for categories (any not listed appear at the end)
const CATEGORY_ORDER = [
    "Fridge",
    "Fresh Produce",
    "Pantry",
    "Meat & Alt",
    "Freezer",
    "Spices",
    "Treats",
    "Household",
    "Baby",
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

// Return categories sorted by CATEGORY_ORDER, with any extras appended at the end
function getOrderedCategories() {
    const categoryMap = new Map(window.products.map(cat => [cat.name, cat]));
    const ordered = CATEGORY_ORDER.filter(name => categoryMap.has(name)).map(name => categoryMap.get(name));
    const remaining = window.products.filter(cat => !CATEGORY_ORDER.includes(cat.name));
    return [...ordered, ...remaining];
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
    const categories = getOrderedCategories();

    if (categories.length === 0) {
        elements.mainContent.innerHTML = '<div class="empty-state">All caught up! No more products.</div>';
        return;
    }

    categories.forEach(category => {
        if (!category.items || category.items.length === 0) return;

        const section = document.createElement('div');
        section.className = 'category-section';

        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category.name;
        section.appendChild(title);

        category.items.forEach(product => {
            const card = createProductCard(product, 'browse', undefined, category.name);
            section.appendChild(card);
        });

        elements.mainContent.appendChild(section);
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

function createProductCard(product, mode, index, categoryName) {
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
    const emoji = getEmojiForProduct(product, categoryName);
    nameLink.textContent = `${emoji} ${product.name}`;
    // Use Google "I'm Feeling Lucky" restricted to the site
    const query = `site:www.dunnesstoresgrocery.com "${product.name}"`;
    nameLink.href = product.url || `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=1`;
    nameLink.target = "_blank";

    info.appendChild(nameLink);

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
// Helper to determine emoji based on name/category
function getEmojiForProduct(product, categoryName) {
    if (product.icon) return product.icon;
    const name = product.name.toLowerCase();
    const cat = categoryName || '';

    // Specific Keyword Matches
    if (name.includes('milk')) return '🥛';
    if (name.includes('egg')) return '🥚';
    if (name.includes('cheese') || name.includes('mozzarella') || name.includes('brie') || name.includes('ricotta') || name.includes('cheddar')) return '🧀';
    if (name.includes('butter')) return '🧈';
    if (name.includes('yogurt') || name.includes('yoghurt')) return '🥣';
    if (name.includes('cream')) return '🥛';

    if (name.includes('bread') || name.includes('sourdough') || name.includes('wraps')) return '🍞';
    if (name.includes('chocolate') || name.includes('cocoa') || name.includes('reese')) return '🍫';
    if (name.includes('biscuit') || name.includes('wafer') || name.includes('bar') || name.includes('flapjack') || name.includes('treatsize')) return '🍪';
    if (name.includes('rice') || name.includes('pasta') || name.includes('wheat') || name.includes('grain')) return '🍚';
    if (name.includes('bean') || name.includes('chickpea') || name.includes('lentil') || name.includes('tomato') || name.includes('passata')) return '🥫';
    if (name.includes('oil') || name.includes('sauce')) return '🍶';
    if (name.includes('tea') || name.includes('coffee')) return '☕';
    if (name.includes('water') || name.includes('juice') || name.includes('drink')) return '🥤';

    // Fruit
    if (name.includes('strawberry') || name.includes('berry') || name.includes('currant')) return '🍓';
    if (name.includes('banana')) return '🍌';
    if (name.includes('apple')) return '🍎';
    if (name.includes('orange') || name.includes('citrus') || name.includes('grapefruit') || name.includes('peeler')) return '🍊';
    if (name.includes('kiwi')) return '🥝';
    if (name.includes('avocado')) return '🥑';
    if (name.includes('grape')) return '🍇';

    // Veg
    if (name.includes('carrot')) return '🥕';
    if (name.includes('potato')) return '🥔';
    if (name.includes('onion') || name.includes('garlic') || name.includes('leek')) return '🧅';
    if (name.includes('tomato')) return '🍅';
    if (name.includes('cucumber') || name.includes('courgette')) return '🥒';
    if (name.includes('salad') || name.includes('rocket') || name.includes('spinach') || name.includes('lettuce')) return '🥗';
    if (name.includes('corn')) return '🌽';
    if (name.includes('broccoli') || name.includes('cauliflower')) return '🥦';
    if (name.includes('pepper') || name.includes('chilli')) return '🌶️';
    if (name.includes('mushroom')) return '🍄';
    if (name.includes('ginger')) return '🫚';

    // Meat/Alt
    if (name.includes('chicken') || name.includes('turkey')) return '🍗';
    if (name.includes('beef') || name.includes('steak') || name.includes('burger') || name.includes('meatball') || name.includes('cheatball')) return '🥩';
    if (name.includes('ham') || name.includes('pork') || name.includes('bacon')) return '🥓';
    if (name.includes('fish') || name.includes('salmon')) return '🐟';
    if (name.includes('quorn') || name.includes('tofu') || name.includes('vegan') || name.includes('veggie')) return '🌱';

    // Household
    if (name.includes('cat') || name.includes('dog') || name.includes('pet')) return '🐱';
    if (name.includes('tissue') || name.includes('roll') || name.includes('towel')) return '🧻';
    if (name.includes('clean') || name.includes('wash') || name.includes('liquid') || name.includes('tablet') || name.includes('rinse')) return '🧼';
    if (name.includes('brush') || name.includes('pad')) return '🧽';

    // Default by Category
    if (cat === 'Fridge') return '❄️';
    if (cat === 'Frozen' || cat === 'Freezer') return '🧊';
    if (cat === 'Fresh Produce') return '🥦';
    if (cat === 'Pantry') return '🥫';
    if (cat === 'Household') return '🏠';
    if (cat === 'Baby') return '👶';
    if (cat === 'Treats') return '🍪';

    return '📦';
}

init();
