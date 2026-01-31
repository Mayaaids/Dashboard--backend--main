// Login Page Logic
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loginBtn = document.getElementById('loginBtn');
    const loginForm = document.getElementById('loginForm');

    // Clear error message
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';

    // Show loading state
    loadingSpinner.classList.add('show');
    loginBtn.disabled = true;
    loginForm.classList.add('glitch');

    try {
        // Simulate network delay for authenticity
        await new Promise(resolve => setTimeout(resolve, 500));

        // Send login request to backend
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store session token
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('username', username);

            // Add success animation
            loginBtn.textContent = '✓ ACCESS GRANTED';
            loginBtn.style.background = 'rgba(0, 255, 0, 0.2)';
            loadingSpinner.textContent = 'Redirecting to dashboard...';
            loadingSpinner.innerHTML = '<span class="spinner"></span>Redirecting to dashboard...';

            // Redirect to dashboard after brief delay
            setTimeout(() => {
                window.location.href = '/';
            }, 800);
        } else {
            // Authentication failed
            throw new Error(data.message || 'Authentication failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = '❌ ' + (error.message || 'Authentication failed. Please try again.');
        errorMessage.classList.add('show');
        
        // Reset form
        loadingSpinner.classList.remove('show');
        loginBtn.disabled = false;
        loginForm.classList.remove('glitch');
        loginBtn.textContent = 'ACCESS GRANTED';
        loginBtn.style.background = 'transparent';
        
        // Focus on password field for retry
        document.getElementById('password').focus();
    }
}

// Check if user is already logged in
window.addEventListener('load', () => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
        // Redirect to dashboard if already authenticated
        window.location.href = '/';
    }
    
    // Set focus on username field
    document.getElementById('username').focus();
});

// Allow Enter key on password field to submit
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('loginForm').dispatchEvent(new Event('submit'));
            }
        });
    }
});
