import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =====================================================
   FIREBASE CONFIG
   ===================================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyDwKzLHzv45HaHhsjLgXOXZgiwJ-ntoOf4",

    authDomain:
        "roseandcrews-652c1.firebaseapp.com",

    projectId:
        "roseandcrews-652c1",

    storageBucket:
        "roseandcrews-652c1.firebasestorage.app",

    messagingSenderId:
        "701747958216",

    appId:
        "1:701747958216:web:4ed7c8e60303d443eeb0fd"

};


/* =====================================================
   INITIALIZE FIREBASE
   ===================================================== */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* =====================================================
   LOGIN ELEMENTS
   ===================================================== */

const loginForm =
    document.getElementById("loginForm");

const loginSubmit =
    document.getElementById("loginSubmit");

const loginResult =
    document.getElementById("loginResult");


/* =====================================================
   LOGIN
   ===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("loginUsername")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            if (!username || !password) {

                showError(
                    "Please enter your email and password."
                );

                return;

            }


            loginSubmit.disabled =
                true;

            loginSubmit.textContent =
                "SIGNING IN...";


            try {

                /*
                 * Firebase login
                 */

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        username,
                        password
                    );


                const user =
                    userCredential.user;


                /*
                 * Save Firebase UID
                 * for dashboard
                 */

                localStorage.setItem(
                    "roseCrewsFirebaseUID",
                    user.uid
                );


                localStorage.setItem(
                    "roseCrewsUserEmail",
                    user.email
                );


                /*
                 * Login successful
                 */

                showSuccess(
                    "LOGIN SUCCESSFUL"
                );


                /*
                 * Go to dashboard
                 */

                setTimeout(function () {

                    window.location.href =
                        "dashboard.html";

                }, 700);


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                let message =
                    "Login failed. Please check your details.";


                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    message =
                        "Incorrect email or password.";

                }

                else if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    message =
                        "Account not found.";

                }

                else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    message =
                        "Incorrect password.";

                }

                else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    message =
                        "Too many attempts. Please try again later.";

                }


                showError(message);


                loginSubmit.disabled =
                    false;

                loginSubmit.textContent =
                    "LOGIN";

            }

        }
    );

}


/* =====================================================
   SUCCESS MESSAGE
   ===================================================== */

function showSuccess(message) {

    if (!loginResult) return;


    loginResult.style.display =
        "block";


    loginResult.innerHTML = `

        <div class="login-success">

            <div class="login-success-icon">
                ✓
            </div>

            <strong>
                ${message}
            </strong>

        </div>

    `;

}


/* =====================================================
   ERROR MESSAGE
   ===================================================== */

function showError(message) {

    if (!loginResult) return;


    loginResult.style.display =
        "block";


    loginResult.innerHTML = `

        <div class="login-error">

            <span>⚠</span>

            <strong>
                ${message}
            </strong>

        </div>

    `;

}

/* =====================================================
   PASSWORD VISIBILITY
   ===================================================== */

const passwordToggle =
    document.getElementById("passwordToggle");

const passwordInput =
    document.getElementById("loginPassword");

if (passwordToggle && passwordInput) {

    passwordToggle.addEventListener(
        "click",
        function () {

            const showing =
                passwordInput.type === "text";

            passwordInput.type =
                showing ? "password" : "text";

            passwordToggle.textContent =
                showing ? "SHOW" : "HIDE";

            passwordToggle.setAttribute(
                "aria-label",
                showing ? "Show password" : "Hide password"
            );

            passwordToggle.setAttribute(
                "aria-pressed",
                String(!showing)
            );

        }
    );

}
