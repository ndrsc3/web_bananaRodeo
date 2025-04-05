// Constants
const AUTH_KEY = 'banana_rodeo_auth';
const INDEX_PATH = '/index.html';
const HOME_PATH = '/pages/home.html';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface AuthState {
    authenticated: boolean;
    timestamp: number;
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) return false;

    try {
        const state: AuthState = JSON.parse(authData);
        const now = Date.now();
        const expired = now - state.timestamp > SESSION_DURATION;
        
        if (expired) {
            localStorage.removeItem(AUTH_KEY);
            return false;
        }
        
        return state.authenticated;
    } catch {
        localStorage.removeItem(AUTH_KEY);
        return false;
    }
};

// Set authentication state
export const setAuthenticated = (value: boolean): void => {
    const state: AuthState = {
        authenticated: value,
        timestamp: Date.now()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
};

// Handle auth redirects
export const handleAuthRedirect = (): void => {
    const currentPath = window.location.pathname;
    
    // If at root or index, redirect to home if authenticated
    if ((currentPath === '/' || currentPath === INDEX_PATH) && isAuthenticated()) {
        window.location.href = HOME_PATH;
        return;
    }
    
    // If not at index and not authenticated, redirect to index with return URL
    if (currentPath !== INDEX_PATH && !isAuthenticated()) {
        const returnUrl = encodeURIComponent(currentPath);
        window.location.href = `${INDEX_PATH}?redirect=${returnUrl}`;
        return;
    }
}; 