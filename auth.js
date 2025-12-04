// --- CẤU HÌNH API ---
const APPSCRIPT_API_URL = 'https://script.google.com/macros/s/AKfycbzwBiyhbqL7ke_4E-psldCYukEQbD2tVSdylCKdeG8AfATLRypdiBS8aQnvT6NI33Pp8w/exec'; // <<< THAY THẾ URL DEPLOY CỦA APPSCRIPT >>>
const TOKEN_KEY = 'user_session_token';

// --- HÀM GỌI API CHUNG ---
async function callApi(action, payload = {}) {
    try {
        const response = await fetch(APPSCRIPT_API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, ...payload }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error calling Apps Script API:", error);
        return { success: false, message: "Lỗi kết nối hoặc lỗi máy chủ." };
    }
}

// --- LOGIC XỬ LÝ ĐĂNG NHẬP ---
async function handleLogin(username, password, remember) {
    const result = await callApi('login', { username, password, remember });
    
    if (result.success) {
        // Lưu token vào Local Storage
        localStorage.setItem(TOKEN_KEY, result.token);
    }
    return result;
}

// --- LOGIC LẤY TOKEN ---
function getSessionToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// --- LOGIC KIỂM TRA PHIÊN (trả về username nếu hợp lệ) ---
async function validateAndRedirect(redirectIfInvalid = '/login.html', redirectIfValid = null) {
    const token = getSessionToken();
    if (!token) {
        if (redirectIfInvalid) window.location.href = redirectIfInvalid;
        return { isAuthenticated: false };
    }

    const result = await callApi('validateSession', { token });

    if (result.success) {
        // Kiểm tra thêm thời gian hết hạn (tùy chọn)
        if (Date.now() > result.expiresAt) {
            localStorage.removeItem(TOKEN_KEY);
            if (redirectIfInvalid) window.location.href = redirectIfInvalid;
            return { isAuthenticated: false };
        }
        
        if (redirectIfValid) window.location.href = redirectIfValid;
        return { isAuthenticated: true, username: result.username };
    } else {
        // Phiên không hợp lệ/hết hạn -> xóa token và chuyển hướng
        localStorage.removeItem(TOKEN_KEY);
        if (redirectIfInvalid) window.location.href = redirectIfInvalid;
        return { isAuthenticated: false };
    }
}

// --- LOGIC ĐĂNG XUẤT ---
async function handleLogout() {
    const token = getSessionToken();
    if (token) {
        // Gọi API xóa session trên Sheet (tùy chọn, để đảm bảo sạch)
        await callApi('logout', { token }); 
        localStorage.removeItem(TOKEN_KEY);
    }
    // Chuyển hướng về trang đăng nhập
    window.location.href = '/login.html';
}

// --- LOGIC LẤY THÔNG TIN USER ---
async function getUserInfo() {
    const token = getSessionToken();
    if (!token) return { success: false, message: 'Chưa đăng nhập.' };

    const result = await callApi('getUserInfo', { token });
    return result;
}
