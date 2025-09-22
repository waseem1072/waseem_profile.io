// Sample product data (can be replaced with real API later)
const products = [
  { id: 1, name: 'Wireless Headphones', category: 'Audio', price: 79.99, oldPrice: 99.99, featured: true, image: 'https://images.unsplash.com/photo-1518443282830-6160d8298b31?q=80&w=1200&auto=format&fit=crop' },
  { id: 2, name: 'Smart Watch', category: 'Wearables', price: 129.00, oldPrice: null, featured: false, image: 'https://images.unsplash.com/photo-1518443895914-1f1c1b1bb9f4?q=80&w=1200&auto=format&fit=crop' },
  { id: 3, name: 'Mechanical Keyboard', category: 'Accessories', price: 89.50, oldPrice: 119.00, featured: false, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop' },
  { id: 4, name: '4K Monitor', category: 'Displays', price: 349.99, oldPrice: 399.99, featured: true, image: 'https://images.unsplash.com/photo-1512446816042-444d641267b3?q=80&w=1200&auto=format&fit=crop' },
  { id: 5, name: 'Gaming Mouse', category: 'Accessories', price: 39.99, oldPrice: 59.99, featured: false, image: 'https://images.unsplash.com/photo-1585079542156-2755d9c0e7f8?q=80&w=1200&auto=format&fit=crop' },
  { id: 6, name: 'Bluetooth Speaker', category: 'Audio', price: 49.99, oldPrice: null, featured: false, image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop' },
  { id: 7, name: 'Laptop Stand', category: 'Accessories', price: 24.99, oldPrice: null, featured: false, image: 'https://images.unsplash.com/photo-1602080858428-57174f9431cf?q=80&w=1200&auto=format&fit=crop' },
  { id: 8, name: 'Noise Cancelling Earbuds', category: 'Audio', price: 59.99, oldPrice: 79.99, featured: true, image: 'https://images.unsplash.com/photo-1606229365485-93a3b8d4f3c4?q=80&w=1200&auto=format&fit=crop' },
  { id: 9, name: 'Fitness Tracker', category: 'Wearables', price: 69.99, oldPrice: 89.99, featured: false, image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop' },
  { id: 10, name: 'HD Webcam', category: 'Accessories', price: 54.00, oldPrice: 69.00, featured: false, image: 'https://images.unsplash.com/photo-1615493713253-b6d86cf207ee?q=80&w=1200&auto=format&fit=crop' },
  { id: 11, name: 'E-reader', category: 'Gadgets', price: 99.00, oldPrice: 129.00, featured: false, image: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=1200&auto=format&fit=crop' },
  { id: 12, name: 'Action Camera', category: 'Gadgets', price: 149.00, oldPrice: null, featured: true, image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1200&auto=format&fit=crop' }
];

const state = {
  query: '',
  category: 'all',
  sort: 'relevance'
};

const dom = {
  grid: document.getElementById('productGrid'),
  empty: document.getElementById('emptyState'),
  search: document.getElementById('searchInput'),
  category: document.getElementById('categoryFilter'),
  sort: document.getElementById('sortSelect')
};

function populateCategories() {
  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    dom.category.appendChild(option);
  });
}

function formatPrice(value) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-media">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      ${product.featured ? '<span class="badge">Featured</span>' : ''}
    </div>
    <div class="card-body">
      <h3 class="name">${product.name}</h3>
      <p class="category">${product.category}</p>
      <div class="price-row">
        <span class="price">${formatPrice(product.price)}</span>
        ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
      </div>
      <div class="actions">
        <button class="btn" onclick="addToCart('${product.id}')">Add to Cart</button>
        <button class="btn primary" onclick="buyNow('${product.id}')">Buy</button>
      </div>
      <div class="review-section">
        <button class="btn-review" onclick="openReviewModal('${product.id}', '${product.name}')">Leave Review</button>
      </div>
    </div>
  `;
  return card;
}

function applyFilters(list) {
  let filtered = list;
  if (state.query) {
    const q = state.query.toLowerCase();
    filtered = filtered.filter(p => (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ));
  }
  if (state.category !== 'all') {
    filtered = filtered.filter(p => p.category === state.category);
  }
  return filtered;
}

function applySort(list) {
  const sorted = [...list];
  switch (state.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'relevance':
    default:
      // Featured first as a simple relevance signal
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }
  return sorted;
}

function render() {
  const filtered = applyFilters(products);
  const finalList = applySort(filtered);

  dom.grid.innerHTML = '';
  if (finalList.length === 0) {
    dom.empty.hidden = false;
    return;
  }
  dom.empty.hidden = true;
  const fragment = document.createDocumentFragment();
  finalList.forEach(p => fragment.appendChild(createProductCard(p)));
  dom.grid.appendChild(fragment);
}

function bindEvents() {
  dom.search.addEventListener('input', (e) => {
    state.query = e.target.value.trim();
    render();
  });
  dom.category.addEventListener('change', (e) => {
    state.category = e.target.value;
    render();
  });
  dom.sort.addEventListener('change', (e) => {
    state.sort = e.target.value;
    render();
  });
}

// Review System Functions
function openReviewModal(productId, productName) {
  console.log('Opening review modal for product:', productName);
  document.getElementById('reviewProductId').value = productId;
  document.querySelector('#reviewModal .modal-header h3').textContent = `Review: ${productName}`;
  
  // Show modal with animation
  const modal = document.getElementById('reviewModal');
  modal.classList.add('show');
  modal.style.opacity = '0';
  modal.style.transform = 'scale(0.9)';
  
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 10);
  
  document.getElementById('aiResponse').hidden = true;
}

function closeReviewModal() {
  console.log('Close review modal function called!');
  
  // Hide modal with animation
  const modal = document.getElementById('reviewModal');
  modal.style.opacity = '0';
  modal.style.transform = 'scale(0.9)';
  
  setTimeout(() => {
    modal.classList.remove('show');
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 150);
  
  // Reset form and hide response
  document.getElementById('reviewForm').reset();
  document.getElementById('aiResponse').hidden = true;
}

async function submitReview(event) {
  event.preventDefault();
  console.log('Submit review function called!');
  
  const productId = document.getElementById('reviewProductId').value;
  const customerName = document.getElementById('reviewName').value;
  const rating = document.getElementById('reviewRating').value;
  const review = document.getElementById('reviewText').value;
  
  console.log('Form data:', { productId, customerName, rating, review });
  
  // Show success message and close immediately
  document.getElementById('aiResponseText').textContent = 'Thank you for your review! Your feedback has been submitted successfully.';
  document.getElementById('aiResponse').hidden = false;
  
  // Ensure close button works when AI response is shown
  const closeAiBtn = document.getElementById('closeAiResponse');
  if (closeAiBtn) {
    closeAiBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('AI Response close button clicked (onclick)');
      closeAiResponse();
    };
    console.log('AI Response close button onclick handler attached');
  } else {
    console.error('AI Response close button not found!');
  }
  
  // Don't auto-close - let user close manually
  
  // Try to send to server (will fail gracefully)
  try {
    const response = await fetch('http://localhost:3001/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        review: review,
        productId: productId,
        rating: rating,
        customerName: customerName
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('aiResponseText').textContent = data.reply;
      document.getElementById('aiResponse').hidden = false;
    }
  } catch (error) {
    console.log('Server not running, showing success message instead');
  }
}

function addToCart(productId) {
  alert(`Added product ${productId} to cart!`);
}

function buyNow(productId) {
  alert(`Buying product ${productId} now!`);
}

function closeAiResponse() {
  console.log('Close AI response function called!');
  const aiResponse = document.getElementById('aiResponse');
  if (aiResponse) {
    aiResponse.hidden = true;
    console.log('AI response hidden successfully');
  } else {
    console.error('AI response element not found!');
  }
}

// Make functions global for onclick handlers
window.openReviewModal = openReviewModal;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.closeReviewModal = closeReviewModal;
window.submitReview = submitReview;
window.closeAiResponse = closeAiResponse;

// Init
populateCategories();
bindEvents();
render();

// Bind review modal events after DOM is ready
setTimeout(() => {
  const reviewModal = document.getElementById('reviewModal');
  const reviewForm = document.getElementById('reviewForm');
  const closeBtn = document.getElementById('closeReviewModal');
  const cancelBtn = document.getElementById('cancelReview');
  const closeAiBtn = document.getElementById('closeAiResponse');
  
  // Form submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', submitReview);
    console.log('Review form event listener added');
  }
  
  // Close button (×)
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button (×) clicked');
      closeReviewModal();
    });
    console.log('Close button event listener added');
  }
  
  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Cancel button clicked');
      closeReviewModal();
    });
    console.log('Cancel button event listener added');
  }
  
  // AI Response close button
  if (closeAiBtn) {
    closeAiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('AI Response close button clicked');
      closeAiResponse();
    });
    console.log('AI Response close button event listener added');
  } else {
    console.log('AI Response close button not found during initialization');
  }
  
  // Click outside modal to close (disabled for more control)
  // if (reviewModal) {
  //   reviewModal.addEventListener('click', function(e) {
  //     if (e.target === reviewModal) {
  //       console.log('Clicked outside modal');
  //       closeReviewModal();
  //     }
  //   });
  //   console.log('Modal backdrop click event listener added');
  // }
  
  // ESC key to close (disabled for more control)
  // document.addEventListener('keydown', function(e) {
  //   if (e.key === 'Escape' && reviewModal.classList.contains('show')) {
  //     console.log('ESC key pressed');
  //     closeReviewModal();
  //   }
  // });
}, 100);


// ---------------------------
// Chat widget logic (OpenAI)
// ---------------------------
const CHAT_API_URL = 'http://localhost:3001/api/chat'; // OpenAI-powered chatbot

const chatDom = {
  toggle: document.getElementById('chatToggle'),
  widget: document.getElementById('chatWidget'),
  close: document.getElementById('chatClose'),
  messages: document.getElementById('chatMessages'),
  form: document.getElementById('chatForm'),
  input: document.getElementById('chatInput')
};

function appendMessage(role, text) {
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  chatDom.messages.appendChild(el);
  chatDom.messages.scrollTop = chatDom.messages.scrollHeight;
}

let typingEl = null;
function setTyping(visible) {
  if (visible) {
    if (!typingEl) {
      typingEl = document.createElement('div');
      typingEl.className = 'msg bot';
      typingEl.textContent = 'Typing…';
      chatDom.messages.appendChild(typingEl);
    }
  } else if (typingEl) {
    typingEl.remove();
    typingEl = null;
  }
}

function openChat() {
  chatDom.widget.hidden = false;
  setTimeout(() => chatDom.input.focus(), 0);
}
function closeChat() { chatDom.widget.hidden = true; }

        async function sendToOpenAI(message) {
            console.log('Sending message to OpenAI:', CHAT_API_URL);
            console.log('Message:', message);
            
            try {
                const payload = { 
                    message: message,
                    conversationId: 'main-conversation' // Keep conversation context
                };
                
                const response = await fetch(CHAT_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Request failed:', response.status, errorData);
                    throw new Error(errorData.error || `Request failed (${response.status})`);
                }
                
                const data = await response.json();
                console.log('OpenAI response:', data);
                return data.reply || 'Sorry, I could not process your request.';
                
            } catch (error) {
                console.error('Chat error:', error);
                if (error.message.includes('Failed to fetch')) {
                    throw new Error('Could not connect to the chatbot server. Make sure the server is running on port 3001.');
                }
                throw error;
            }
        }

if (chatDom.toggle && chatDom.form) {
  chatDom.toggle.addEventListener('click', openChat);
  chatDom.close.addEventListener('click', closeChat);
  chatDom.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatDom.input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    chatDom.input.value = '';
    setTyping(true);
    try {
      const reply = await sendToOpenAI(text);
      setTyping(false);
      appendMessage('bot', reply || '');
    } catch (err) {
      setTyping(false);
      appendMessage('bot', err.message || 'Sorry, something went wrong.');
    }
  });
}

