document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    if (!email || !password) {
        alert('يرجى ملء جميع الحقول');
        return;
    }

    const btn = event.target.querySelector('.btn');
    btn.disabled = true;
    btn.textContent = 'جاري الدخول...';
    btn.style.background = 'linear-gradient(45deg, #ff9671, #ff6f91)';
    btn.style.boxShadow = '0 0 30px #ff9671';

    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
if (response.ok) {
    alert(data.message);
    // Store user info in sessionStorage
    sessionStorage.setItem('userId', data.user.id);
    sessionStorage.setItem('userName', data.user.name);
    window.location.href = 'http://localhost:3001/dashboard';
} else {
    alert(data.message || 'بيانات الدخول غير صحيحة');
}
    } catch (error) {
        alert('فشل الاتصال بالخادم');
    } finally {
        btn.disabled = false;
        btn.textContent = 'دخول';
        btn.style.background = 'linear-gradient(45deg, #ff6f91, #ff9671)';
        btn.style.boxShadow = '0 0 20px #ff6f91';
    }
});
