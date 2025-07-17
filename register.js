document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = event.target.name.value.trim();
    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();
    const confirmPassword = event.target.confirmPassword.value.trim();

    if (!name || !email || !password || !confirmPassword) {
        alert('يرجى ملء جميع الحقول');
        return;
    }

    if (password !== confirmPassword) {
        alert('كلمتا المرور غير متطابقتين');
        return;
    }

    const btn = event.target.querySelector('.btn');
    btn.disabled = true;
    btn.textContent = 'جاري التسجيل...';
    btn.style.background = 'linear-gradient(45deg, #2980b9, #3498db)';
    btn.style.boxShadow = '0 0 30px #2980b9';

    try {
        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            event.target.reset();
        } else {
            alert(data.message || 'حدث خطأ أثناء التسجيل');
        }
    } catch (error) {
        alert('فشل الاتصال بالخادم');
    } finally {
        btn.disabled = false;
        btn.textContent = 'تسجيل';
        btn.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
        btn.style.boxShadow = '0 0 20px #3498db';
    }
});
