// File: /js/auth.js

function getUsersDB() {
    return JSON.parse(localStorage.getItem('bluestoneUsersDB')) || {};
}

function saveUsersDB(db) {
    localStorage.setItem('bluestoneUsersDB', JSON.stringify(db));
}

function setCurrentUser(user) {
    localStorage.setItem('bluestoneUser', JSON.stringify(user));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('bluestoneUser'));
}

function logoutUser() {
    localStorage.removeItem('bluestoneUser');
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Logic for the login.html page ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showLoginBtn = document.getElementById('show-login-btn');
    const showSignupBtn = document.getElementById('show-signup-btn');

    if (loginForm) { // This ensures the code only runs on login.html
        
        // Check URL for which form to show on page load
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('form') === 'signup') {
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
            showSignupBtn.classList.add('active');
            showLoginBtn.classList.remove('active');
        }
        
        // Form Toggling Logic
        showLoginBtn.addEventListener('click', () => {
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
            showLoginBtn.classList.add('active');
            showSignupBtn.classList.remove('active');
        });

        showSignupBtn.addEventListener('click', () => {
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
            showSignupBtn.classList.add('active');
            showLoginBtn.classList.remove('active');
        });

        // Signup Logic (unchanged)
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const feedbackEl = document.getElementById('signup-feedback');
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;

            if (!name || !email || !password) {
                feedbackEl.textContent = 'All fields are required.';
                feedbackEl.className = 'feedback-message error';
                return;
            }
            const usersDB = getUsersDB();
            if (usersDB[email]) {
                feedbackEl.textContent = 'An account with this email already exists. Please login.';
                feedbackEl.className = 'feedback-message error';
                return;
            }
            usersDB[email] = { name, password };
            saveUsersDB(usersDB);
            setCurrentUser({ name, email });
            window.location.href = 'index.html';
        });

        // Login Logic (unchanged)
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const feedbackEl = document.getElementById('login-feedback');
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;
            const usersDB = getUsersDB();
            const userRecord = usersDB[email];

            if (userRecord && userRecord.password === password) {
                setCurrentUser({ name: userRecord.name, email });
                window.location.href = 'index.html';
            } else {
                feedbackEl.textContent = 'Invalid email or password.';
                feedbackEl.className = 'feedback-message error';
            }
        });
    }

    // --- Part 2: Header update logic for ALL pages ---
    const topBarContainer = document.getElementById('top-bar-container');
    const user = getCurrentUser();

    if (topBarContainer) {
        if (user) {
            topBarContainer.innerHTML = `
                <a href="tel:1800-419-0066">1800-419-0066</a> |
                <a href="#">Video Call Cart</a> |
                <a href="account.html" class="account-link">Welcome, ${user.name}!</a> |
                <a href="#" id="logout-link">Logout</a>
            `;
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    logoutUser();
                });
            }
        } else {
            // Update the links here to ensure consistency
            topBarContainer.innerHTML = `
                <a href="tel:1800-419-0066">1800-419-0066</a> |
                <a href="#">Video Call Cart</a> |
                <a href="login.html" id="login-link">Login</a> |
                <a href="login.html?form=signup" id="signup-link">Signup</a>
            `;
        }
    }
});