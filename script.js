// ================================
// NEXO - Main JavaScript
// ================================

const SUPABASE_URL = "https://ysmhdowriyrfgodnawrm.supabase.co";
const SUPABASE_KEY = "sb_publishable_f9FdiREBW0xMMvt8ozSvDQ_6wSQgMrh";

// Supabase client
let supabaseClient = null;

// تحميل Supabase إذا كانت المكتبة موجودة
if (window.supabase) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}

// ================================
// NEXO App
// ================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("NEXO started successfully");

    setupNavigation();
    setupButtons();
    checkUser();
});

// ================================
// Navigation
// ================================

function setupNavigation() {

    const links = document.querySelectorAll("[data-page]");

    links.forEach(link => {
        link.addEventListener("click", () => {

            const page = link.dataset.page;

            if (!page) return;

            showPage(page);
        });
    });
}

function showPage(page) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(item => {
        item.style.display = "none";
    });

    const selectedPage = document.getElementById(page);

    if (selectedPage) {
        selectedPage.style.display = "block";
    }
}

// ================================
// Buttons
// ================================

function setupButtons() {

    const buttons = document.querySelectorAll("button");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const action = button.dataset.action;

            if (!action) return;

            switch (action) {

                case "login":
                    login();
                    break;

                case "logout":
                    logout();
                    break;

                case "create-post":
                    createPost();
                    break;

                case "profile":
                    showPage("profile");
                    break;

                default:
                    console.log("Unknown action:", action);
            }
        });
    });
}

// ================================
// Authentication
// ================================

async function checkUser() {

    if (!supabaseClient) {
        console.log("Supabase library not loaded yet.");
        return;
    }

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error) {
        console.log("No authenticated user.");
        return;
    }

    if (data.user) {
        console.log("Logged in:", data.user.email);
        updateUserInterface(data.user);
    }
}

async function login() {

    if (!supabaseClient) {
        alert("Supabase غير جاهز.");
        return;
    }

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    if (!emailInput || !passwordInput) {
        alert("حقول تسجيل الدخول غير موجودة.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("أدخل البريد الإلكتروني وكلمة المرور.");
        return;
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        alert(error.message);
        return;
    }

    alert("تم تسجيل الدخول بنجاح!");

    updateUserInterface(data.user);
}

async function logout() {

    if (!supabaseClient) return;

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {
        alert(error.message);
        return;
    }

    location.reload();
}

// ================================
// User Interface
// ================================

function updateUserInterface(user) {

    if (!user) return;

    const userEmail =
        document.getElementById("user-email");

    if (userEmail) {
        userEmail.textContent = user.email;
    }

    const loginButton =
        document.querySelector('[data-action="login"]');

    const logoutButton =
        document.querySelector('[data-action="logout"]');

    if (loginButton) {
        loginButton.style.display = "none";
    }

    if (logoutButton) {
        logoutButton.style.display = "block";
    }
}

// ================================
// Posts
// ================================

async function createPost() {

    if (!supabaseClient) {
        alert("Supabase غير جاهز.");
        return;
    }

    const { data: userData } =
        await supabaseClient.auth.getUser();

    const user = userData.user;

    if (!user) {
        alert("يجب تسجيل الدخول أولًا.");
        return;
    }

    const textInput =
        document.getElementById("post-text");

    if (!textInput) {
        alert("حقل المنشور غير موجود.");
        return;
    }

    const text = textInput.value.trim();

    if (!text) {
        alert("اكتب شيئًا قبل النشر.");
        return;
    }

    const { error } =
        await supabaseClient
            .from("posts")
            .insert({
                user_id: user.id,
                content: text
            });

    if (error) {
        console.error(error);
        alert("حدث خطأ أثناء نشر المنشور.");
        return;
    }

    textInput.value = "";

    alert("تم نشر المنشور بنجاح!");

    loadPosts();
}

// ================================
// Load Posts
// ================================

async function loadPosts() {

    if (!supabaseClient) return;

    const postsContainer =
        document.getElementById("posts");

    if (!postsContainer) return;

    const { data, error } =
        await supabaseClient
            .from("posts")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {
        console.error(error);
        return;
    }

    postsContainer.innerHTML = "";

    data.forEach(post => {

        const article =
            document.createElement("article");

        article.className = "post";

        article.innerHTML = `
            <div class="post-content">
                ${escapeHTML(post.content || "")}
            </div>
        `;

        postsContainer.appendChild(article);
    });
}

// ================================
// Security helper
// ================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

// ================================
// Start
// ================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        loadPosts
    );

} else {

    loadPosts();
}
