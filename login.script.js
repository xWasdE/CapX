document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const userIdInput = document.getElementById('user-id');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // Eğer kullanıcı zaten giriş yapmışsa ve login sayfasına geri dönerse, ana sayfaya yönlendir
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = 'index.html';
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Formun varsayılan gönderme işlemini engelle

        const userId = userIdInput.value.trim();
        const password = passwordInput.value.trim();

        // --- KİMLİK BİLGİLERİ KONTROLÜ GÜNCELLENDİ ---
        const isAdmin = userId === 'admin99' && password === '1720xXx';
        const isTestUser = userId === 'test00' && password === 'test69';

        if (isAdmin || isTestUser) {
            // Başarılı giriş
            errorMessage.textContent = '';
            // Oturum için bir bayrak ayarla
            sessionStorage.setItem('isAuthenticated', 'true');
            // Ana sayfaya yönlendir
            window.location.href = 'index.html';
        } else {
            // Başarısız giriş
            errorMessage.textContent = 'Kullanıcı ID veya parola hatalı.';
            // Hata mesajından sonra input alanlarını temizle
            userIdInput.value = '';
            passwordInput.value = '';
            userIdInput.focus();
        }
    });
});