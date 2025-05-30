import type { GuestbookEntry, APIResponse } from './types';

/**
 * Simple form validation - web 1.0 style!
 */
function validateForm(form: HTMLFormElement): boolean {
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const message = form.elements.namedItem('message') as HTMLTextAreaElement;
    const bananaMemory = form.elements.namedItem('bananaMemory') as HTMLTextAreaElement;
    const mood = form.elements.namedItem('mood') as HTMLSelectElement;

    // Required fields check
    if (!name.value.trim()) {
        alert('🤠 Howdy! Please tell us your name!');
        name.focus();
        return false;
    }

    if (!mood.value) {
        alert('🍌 What\'s your mood today, partner?');
        mood.focus();
        return false;
    }

    if (!bananaMemory.value.trim()) {
        alert('🤔 Share a banana memory with us!');
        bananaMemory.focus();
        return false;
    }

    if (!message.value.trim()) {
        alert('📝 Don\'t forget to leave a message!');
        message.focus();
        return false;
    }

    // Simple length checks
    if (message.value.length > 1000) {
        alert('📜 Whoa there! Your message is too long (max 1000 characters)');
        message.focus();
        return false;
    }

    if (bananaMemory.value.length > 500) {
        alert('🍌 That\'s quite a memory! Please keep it under 500 characters');
        bananaMemory.focus();
        return false;
    }

    return true;
}

/**
 * Format date in web 1.0 style
 */
function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Map mood text to emoji
 */
function getMoodEmoji(mood: string): string {
    const moodMap: Record<string, string> = {
        'happy': '😊',
        'excited': '🤩',
        'chill': '😎',
        'sad': '😢',
        'hungry': '😋',
        'sleepy': '😴',
        'energetic': '⚡️'
    };
    return moodMap[mood.toLowerCase()] || '🤔';
}

/**
 * Create HTML for a guestbook entry
 */
function createEntryHTML(entry: GuestbookEntry): string {
    const emailLink = entry.email ? 
        `<a href="mailto:${entry.email}" class="win98-link">📧 ${entry.email}</a>` : '';
    const websiteLink = entry.website ? 
        `<a href="${entry.website}" target="_blank" class="win98-link">🌐 Visit my homepage</a>` : '';
    const location = entry.location ? 
        `<span class="guestbook-location">📍 ${entry.location}</span>` : '';

    return `
        <div class="guestbook-entry win98-window">
            <div class="guestbook-entry-title-bar">
                <div class="guestbook-entry-title">
                    <strong>${entry.name}</strong> ${getMoodEmoji(entry.mood)} - ${formatDate(entry.timestamp)}
                </div>
            </div>
            <div class="win98-window-content">
                <div class="guestbook-entry-content">
                    <div class="guestbook-links">
                        ${emailLink} ${websiteLink} ${location}
                    </div>
                    <div class="guestbook-message">
                        <div class="banana-memory">
                            <strong>🍌 Banana Memory:</strong>
                            <p>${entry.bananaMemory}</p>
                        </div>
                        <div class="message">
                            <strong>Message:</strong>
                            <p>${entry.message}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize the guestbook
 */
export function initializeGuestbook(): void {
    const form = document.getElementById('guestbookForm') as HTMLFormElement;
    const entriesContainer = document.getElementById('guestbookEntries') as HTMLElement;
    const loadMoreBtn = document.getElementById('loadMoreEntries') as HTMLButtonElement;
    const overlay = document.getElementById('submitOverlay');
    
    if (!form || !entriesContainer || !loadMoreBtn || !overlay) {
        console.error('[Guestbook] Required elements not found');
        return;
    }

    let currentPage = 1;
    const perPage = 5;

    // Load initial entries
    loadEntries(1);

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (!validateForm(form)) {
            return;
        }

        overlay.style.display = 'flex';
        
        try {
            const formData = new FormData(form);
            const entry = {
                name: formData.get('name'),
                email: formData.get('email'),
                website: formData.get('website'),
                location: formData.get('location'),
                message: formData.get('message'),
                bananaMemory: formData.get('bananaMemory'),
                mood: formData.get('mood'),
                timestamp: Date.now()
            };

            const response = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });

            const result = await response.json() as APIResponse<GuestbookEntry>;
            
            if (result.success) {
                form.reset();
                alert('🍌 Thanks for signing our guestbook! 🤠');
                // Reload first page of entries
                loadEntries(1);
            } else {
                console.error('[Guestbook] API Error:', result.error);
                throw new Error(result.error || 'Failed to submit entry');
            }
        } catch (error) {
            console.error('[Guestbook] Submission error:', error);
            // Log additional error details
            if (error instanceof Error) {
                console.error('[Guestbook] Error details:', {
                    message: error.message,
                    stack: error.stack,
                    userAgent: navigator.userAgent
                });
            }
            alert(`😢 Oops! Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            overlay.style.display = 'none';
        }
    });

    // Handle load more button
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadEntries(currentPage);
    });

    // Load guestbook entries
    async function loadEntries(page: number): Promise<void> {
        try {
            loadMoreBtn.textContent = '⌛ Loading...';
            loadMoreBtn.disabled = true;
            
            const response = await fetch(`/api/guestbook?page=${page}&perPage=${perPage}`);
            const result = await response.json() as APIResponse<{
                entries: GuestbookEntry[];
                total: number;
                hasMore: boolean;
            }>;
            
            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to load entries');
            }

            const { entries, hasMore } = result.data;
            const entriesHTML = entries.map(createEntryHTML).join('');
            
            if (page === 1) {
                entriesContainer.innerHTML = entriesHTML;
            } else {
                entriesContainer.insertAdjacentHTML('beforeend', entriesHTML);
            }
            
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
            loadMoreBtn.textContent = '📖 Load More Entries';
            loadMoreBtn.disabled = false;
        } catch (error) {
            console.error('[Guestbook] Error loading entries:', error);
            loadMoreBtn.textContent = '❌ Error loading entries. Try again?';
            loadMoreBtn.disabled = false;
        }
    }
} 