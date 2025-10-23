function timeAgo(dateString) {
    const inputDate = new Date(dateString);
    const now = new Date();

    const diffMs = now - inputDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMinutes < 1) {
        return "just now";
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    }
}

document.querySelectorAll('[data-created]').forEach(el => {
    el.textContent =el.textContent+timeAgo(el.dataset.created);
});