/**
 * cookieService.ts
 * Servicio de gestión de cookies para rastreo de comportamiento del usuario.
 * Persiste historial de productos vistos, categorías y búsquedas.
 */

// --- Core Cookie Functions ---

function setCookie(name: string, value: string, days = 30) {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
    const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// --- Browsing History Service ---

const VIEWED_PRODUCTS_KEY = 'ac_viewed_products';   // List of slugs
const VIEWED_CATEGORIES_KEY = 'ac_viewed_categories'; // List of category IDs
const SEARCH_HISTORY_KEY = 'ac_search_history';       // List of search terms
const MAX_HISTORY = 12;

/**
 * Records a product slug in the viewing history cookie.
 */
export function trackProductView(slug: string) {
    const raw = getCookie(VIEWED_PRODUCTS_KEY);
    const history: string[] = raw ? JSON.parse(raw) : [];

    // Prepend current, remove duplicates, cap at MAX_HISTORY
    const updated = [slug, ...history.filter(s => s !== slug)].slice(0, MAX_HISTORY);
    setCookie(VIEWED_PRODUCTS_KEY, JSON.stringify(updated));
}

/**
 * Returns the list of viewed product slugs (most recent first).
 * Excludes the current product if provided.
 */
export function getViewedProductSlugs(excludeSlug?: string): string[] {
    const raw = getCookie(VIEWED_PRODUCTS_KEY);
    const history: string[] = raw ? JSON.parse(raw) : [];
    return excludeSlug ? history.filter(s => s !== excludeSlug) : history;
}

/**
 * Records a category ID in the viewing history cookie.
 */
export function trackCategoryView(categoryId: string) {
    const raw = getCookie(VIEWED_CATEGORIES_KEY);
    const history: string[] = raw ? JSON.parse(raw) : [];

    const updated = [categoryId, ...history.filter(id => id !== categoryId)].slice(0, MAX_HISTORY);
    setCookie(VIEWED_CATEGORIES_KEY, JSON.stringify(updated));
}

/**
 * Returns the list of viewed category IDs (most recent first).
 */
export function getViewedCategoryIds(): string[] {
    const raw = getCookie(VIEWED_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
}

/**
 * Records a search term.
 */
export function trackSearch(term: string) {
    if (!term || term.trim().length < 2) return;
    const raw = getCookie(SEARCH_HISTORY_KEY);
    const history: string[] = raw ? JSON.parse(raw) : [];

    const updated = [term.trim(), ...history.filter(t => t.toLowerCase() !== term.trim().toLowerCase())].slice(0, 10);
    setCookie(SEARCH_HISTORY_KEY, JSON.stringify(updated));
}

/**
 * Returns the list of recent searches.
 */
export function getSearchHistory(): string[] {
    const raw = getCookie(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
}

/**
 * Clears all browsing cookies.
 */
export function clearAllHistory() {
    deleteCookie(VIEWED_PRODUCTS_KEY);
    deleteCookie(VIEWED_CATEGORIES_KEY);
    deleteCookie(SEARCH_HISTORY_KEY);
}
