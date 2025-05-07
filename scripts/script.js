// DOM Elements
const eventsListContainer = document.getElementById('eventsList');
const homeEventsContainer = document.getElementById('homeEvents');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filter');
const dateFilterInput = document.getElementById('dateFilter');
const homeSearchInput = document.getElementById('homeSearch');
const homeFilterSelect = document.getElementById('homeFilter');
const homeDateFilterInput = document.getElementById('homeDateFilter');
const editModal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close-btn');


// Section toggling
function showSection(id) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  // Update active nav button
  document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active-nav'));
  document.querySelector(`nav button[onclick="showSection('${id}')"]`).classList.add('active-nav');
  
  // Refresh the section if needed
  if (id === 'home' || id === 'manage') {
    listEvents();
  }
}

// Event Creation
document.getElementById('eventForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const date = document.getElementById('date').value;
  const location = document.getElementById('location').value.trim();
  const description = document.getElementById('description').value.trim();
  
  if (!title || !date || !location || !description) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  const id = Date.now().toString();
  const event = { id, title, date, location, description };
  let events = JSON.parse(localStorage.getItem('events') || '[]');
  events.push(event);
  localStorage.setItem('events', JSON.stringify(events));
  
  showMessage('Event created successfully!', 'success');
  this.reset();
  listEvents();
  
  // Show animation on the new event
  const newEventElement = document.querySelector(`[data-id="${id}"]`);
  if (newEventElement) {
    newEventElement.classList.add('pulse-animation');
    setTimeout(() => {
      newEventElement.classList.remove('pulse-animation');
    }, 1000);
  }
});

// Show message
function showMessage(text, type, elementId = 'message') {
  const messageEl = document.getElementById(elementId);
  messageEl.textContent = text;
  messageEl.className = type;
  
  setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = '';
  }, 3000);
}

// Event Listing
function listEvents() {
  const now = new Date().toISOString().split('T')[0];
  const events = JSON.parse(localStorage.getItem('events') || '[]');
  
  // For manage section
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const filterValue = filterSelect ? filterSelect.value : 'all';
  const dateFilterValue = dateFilterInput ? dateFilterInput.value : '';
  
  // For home section
  const homeSearchTerm = homeSearchInput ? homeSearchInput.value.toLowerCase() : '';
  const homeFilterValue = homeFilterSelect ? homeFilterSelect.value : 'all';
  const homeDateFilterValue = homeDateFilterInput ? homeDateFilterInput.value : '';
  
  // Sort events by date (newest first)
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Clear containers
  if (eventsListContainer) eventsListContainer.innerHTML = '';
  if (homeEventsContainer) homeEventsContainer.innerHTML = '';
  
  let foundEvents = false;
  let foundHomeEvents = false;
  
  events.forEach(event => {
    // For manage section
    const matchesSearch = event.title.toLowerCase().includes(searchTerm);
    const isUpcoming = event.date >= now;
    const matchesFilter = 
      filterValue === 'all' || 
      (filterValue === 'upcoming' && isUpcoming) || 
      (filterValue === 'past' && !isUpcoming);
    const matchesDate = !dateFilterValue || event.date === dateFilterValue;
    
    // For home section
    const matchesHomeSearch = event.title.toLowerCase().includes(homeSearchTerm);
    const matchesHomeFilter = 
      homeFilterValue === 'all' || 
      (homeFilterValue === 'upcoming' && isUpcoming) || 
      (homeFilterValue === 'past' && !isUpcoming);
    const matchesHomeDate = !homeDateFilterValue || event.date === homeDateFilterValue;
    
    // Create event card for manage section if matches criteria
    if (matchesSearch && matchesFilter && matchesDate && eventsListContainer) {
      foundEvents = true;
      const eventCard = createEventCard(event, !isUpcoming, false);
      eventsListContainer.appendChild(eventCard);
    }
    
    // Create event card for home section if matches criteria
    if (matchesHomeSearch && matchesHomeFilter && matchesHomeDate && homeEventsContainer) {
      foundHomeEvents = true;
      const eventCard = createEventCard(event, !isUpcoming, true);
      homeEventsContainer.appendChild(eventCard);
    }
  });
  
  // Show "no events" message if needed
  if (eventsListContainer) {
    if (!foundEvents) {
      eventsListContainer.innerHTML = '<div class="no-events">No events found matching your criteria.</div>';
    }
  }
  
  if (homeEventsContainer) {
    if (!foundHomeEvents) {
      homeEventsContainer.innerHTML = '<div class="no-events">No events to display. Create your first event!</div>';
    } else {
      homeEventsContainer.insertAdjacentHTML('afterbegin', '<div class="list-title">Your Events</div>');
    }
  }
}

function createEventCard(event, isPast, isReadOnly) {
  const div = document.createElement('div');
  div.className = `event ${isPast ? 'past' : ''}`;
  div.dataset.id = event.id;
  
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  
  let actionsHTML = '';
  if (!isReadOnly) {
    actionsHTML = `
      <div class="actions">
        <button class="warning edit-btn" data-id="${event.id}">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="danger delete-btn" data-id="${event.id}">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
  }
  
  div.innerHTML = `
    <h3>${event.title}</h3>
    <div class="event-meta">
      <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
      <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
    </div>
    <p>${event.description}</p>
    ${actionsHTML}
  `;
  
  // Add event listeners to buttons
  if (!isReadOnly) {
    const editBtn = div.querySelector('.edit-btn');
    const deleteBtn = div.querySelector('.delete-btn');
    
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(event.id, e);
      });
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteEvent(event.id, e);
      });
    }
  }
  
  return div;
}






// Modal Close Events
closeBtn.addEventListener('click', closeEditModal);
window.addEventListener('click', (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});

// Event listeners for search and filter
if (searchInput) {
  searchInput.addEventListener('input', listEvents);
}

if (filterSelect) {
  filterSelect.addEventListener('change', listEvents);
}

if (dateFilterInput) {
  dateFilterInput.addEventListener('change', listEvents);
}

if (homeSearchInput) {
  homeSearchInput.addEventListener('input', listEvents);
}

if (homeFilterSelect) {
  homeFilterSelect.addEventListener('change', listEvents);
}

if (homeDateFilterInput) {
  homeDateFilterInput.addEventListener('change', listEvents);
}

// Clear date filter when clicking on it (for better UX)
if (dateFilterInput) {
  dateFilterInput.addEventListener('click', function() {
    if (this.value) {
      this.value = '';
      listEvents();
    }
  });
}

if (homeDateFilterInput) {
  homeDateFilterInput.addEventListener('click', function() {
    if (this.value) {
      this.value = '';
      listEvents();
    }
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editModal.style.display === 'block') {
    closeEditModal();
  }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  listEvents();
  
  // Add animation class to feature cards on load
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
  
  // Add animation class to welcome message elements
  const welcomeElements = document.querySelectorAll('.welcome-message > *');
  welcomeElements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.2}s`;
  });
});