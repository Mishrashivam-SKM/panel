document.addEventListener('DOMContentLoaded', () => {
    const statusGrid = document.getElementById('status-grid');
    const emptyMessage = document.getElementById('empty-status-message');

    function renderStatusPage() {
        const submissions = JSON.parse(localStorage.getItem('ai_submissions')) || [];

        if (submissions.length === 0) {
            statusGrid.style.display = 'none';
            emptyMessage.style.display = 'block';
            return;
        }

        statusGrid.style.display = 'grid';
        emptyMessage.style.display = 'none';
        
        // Reverse the array to show the most recent submissions first
        statusGrid.innerHTML = submissions.reverse().map(item => `
            <div class="submission-card">
                <div class="submission-image">
                    <img src="${item.imageUrl}" alt="AI Generated Design">
                </div>
                <div class="submission-details">
                    <p class="submission-prompt"><strong>Prompt:</strong> "${item.prompt}"</p>
                    <div class="submission-status">
                        <strong>Status:</strong>
                        <span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderStatusPage();
});