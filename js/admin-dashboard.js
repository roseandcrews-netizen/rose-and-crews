/* =====================================================
   ROSE & CREWS
   ADMIN DASHBOARD — FINAL
   =====================================================

   Features:
   - Firebase authentication
   - Persistent Firebase login
   - Firebase UID matching
   - Case-insensitive Google Sheet columns
   - STATUS / Status / status supported
   - Access / ACCESS / access supported
   - ADMIN access verification
   - Role and Access kept separate
   - Admin profile display
   - Logout
   ===================================================== */


/* =====================================================
   FIREBASE IMPORTS
   ===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
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
   GOOGLE APPS SCRIPT API
   ===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbz7Alv_li574hP_wVpQX7-Ionp9Ib13rUUHOf9xc-XcFmYtusk2oxPb6ftlKthu20nJYg/exec";


/* =====================================================
   ELEMENTS
   ===================================================== */

const loading =
    document.getElementById(
        "adminLoading"
    );

const content =
    document.getElementById(
        "adminContent"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


/* =====================================================
   GET FIELD
   CASE-INSENSITIVE
   ===================================================== */

function getField(
    object,
    fieldName,
    defaultValue = ""
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return defaultValue;

    }


    const wanted =
        String(fieldName)
            .trim()
            .toLowerCase();


    const key =
        Object.keys(object).find(
            function(objectKey) {

                return (
                    String(objectKey)
                        .trim()
                        .toLowerCase()
                    ===
                    wanted
                );

            }
        );


    if (
        key === undefined
    ) {

        return defaultValue;

    }


    const value =
        object[key];


    if (
        value === undefined ||
        value === null
    ) {

        return defaultValue;

    }


    return value;

}


/* =====================================================
   NORMALIZE MEMBER
   ===================================================== */

function normalizeMember(
    member
) {

    return {

        MemberID:
            getField(
                member,
                "MemberID"
            ),

        Username:
            getField(
                member,
                "Username"
            ),

        DisplayName:
            getField(
                member,
                "DisplayName"
            ),

        Role:
            getField(
                member,
                "Role"
            ),

        AvatarURL:
            getField(
                member,
                "AvatarURL"
            ),

        Country:
            getField(
                member,
                "Country"
            ),

        JoinDate:
            getField(
                member,
                "JoinDate"
            ),

        TMP_ID:
            getField(
                member,
                "TMP_ID"
            ),

        TruckersHub_ID:
            getField(
                member,
                "TruckersHub_ID"
            ),

        STATUS:
            getField(
                member,
                "STATUS"
            ),

        FirebaseUID:
            getField(
                member,
                "FirebaseUID"
            ),

        Access:
            getField(
                member,
                "Access"
            )

    };

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/* =====================================================
   SET TEXT
   ===================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    ) {

        element.textContent =
            String(value);

    } else {

        element.textContent =
            "—";

    }

}


/* =====================================================
   SHOW ERROR
   ===================================================== */

function showError(
    message
) {

    console.error(
        "ADMIN DASHBOARD ERROR:",
        message
    );


    if (!loading) {

        return;

    }


    loading.style.display =
        "block";


    loading.innerHTML = `

        <div class="dashboard-error">

            <div style="font-size:40px;">
                ⚠️
            </div>

            <h2>
                ADMIN ACCESS ERROR
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <a
                href="dashboard.html"
                class="btn primary">

                RETURN TO DASHBOARD

            </a>

        </div>

    `;

}


/* =====================================================
   FIREBASE AUTH STATE
   ===================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        console.log(
            "================================="
        );

        console.log(
            "ROSE & CREWS ADMIN AUTH CHECK"
        );

        console.log(
            "Firebase user:",
            user
        );


        /* ---------------------------------------------
           NOT LOGGED IN
           --------------------------------------------- */

        if (!user) {

            showError(
                "You are not logged in."
            );


            setTimeout(
                function() {

                    window.location.href =
                        "login.html";

                },
                1500
            );


            return;

        }


        /* ---------------------------------------------
           FIREBASE UID
           --------------------------------------------- */

        console.log(
            "Firebase UID:",
            user.uid
        );


        try {

            await verifyAdmin(
                user.uid
            );

        } catch (error) {

            console.error(
                "ADMIN DASHBOARD ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to verify admin access."
            );

        }

    }
);


/* =====================================================
   VERIFY ADMIN
   ===================================================== */

async function verifyAdmin(
    firebaseUID
) {

    if (loading) {

        loading.style.display =
            "block";

        loading.textContent =
            "VERIFYING ADMIN ACCESS...";

    }


    /* ---------------------------------------------
       CACHE BUST
       --------------------------------------------- */

    const url =
        API_URL +
        "?sheet=Members&v=" +
        Date.now();


    console.log(
        "Members API:",
        url
    );


    /* ---------------------------------------------
       FETCH
       --------------------------------------------- */

    const response =
        await fetch(
            url,
            {
                method: "GET",
                cache: "no-store"
            }
        );


    console.log(
        "Members API HTTP:",
        response.status
    );


    if (!response.ok) {

        throw new Error(
            "Members database returned HTTP " +
            response.status
        );

    }


    /* ---------------------------------------------
       JSON
       --------------------------------------------- */

    const result =
        await response.json();


    console.log(
        "Members API result:",
        result
    );


    if (!result.success) {

        throw new Error(
            result.error ||
            "Unable to load Members sheet."
        );

    }


    /* ---------------------------------------------
       MEMBERS
       --------------------------------------------- */

    const rawMembers =
        Array.isArray(result.data)
            ? result.data
            : [];


    console.log(
        "Members found:",
        rawMembers.length
    );


    if (
        rawMembers.length === 0
    ) {

        throw new Error(
            "No members were found in the Members sheet."
        );

    }


    /* ---------------------------------------------
       NORMALIZE
       --------------------------------------------- */

    const members =
        rawMembers.map(
            function(member) {

                return normalizeMember(
                    member
                );

            }
        );


    console.log(
        "Normalized members:",
        members
    );


    /* ---------------------------------------------
       CURRENT FIREBASE UID
       --------------------------------------------- */

    const currentUID =
        String(
            firebaseUID || ""
        )
        .trim()
        .toLowerCase();


    console.log(
        "Looking for Firebase UID:",
        currentUID
    );


    /* ---------------------------------------------
       FIND MEMBER
       --------------------------------------------- */

    const member =
        members.find(
            function(item) {

                const sheetUID =
                    String(
                        item.FirebaseUID || ""
                    )
                    .trim()
                    .toLowerCase();


                console.log(
                    "Checking sheet UID:",
                    sheetUID
                );


                return (
                    sheetUID !== "" &&
                    sheetUID === currentUID
                );

            }
        );


    /* ---------------------------------------------
       UID NOT FOUND
       --------------------------------------------- */

    if (!member) {

        throw new Error(
            "Your Firebase UID was not found in the Members sheet."
        );

    }


    console.log(
        "MATCHED MEMBER:",
        member
    );


    /* =================================================
       STATUS CHECK
       ================================================= */

    const status =
        String(
            member.STATUS || ""
        )
        .trim()
        .toUpperCase();


    console.log(
        "Account STATUS:",
        status
    );


    if (
        status !== "ACTIVE"
    ) {

        throw new Error(
            "Your ROSE & CREWS member account is not ACTIVE."
        );

    }


    /* =================================================
       ACCESS CHECK
       ================================================= */

    const access =
        String(
            member.Access || ""
        )
        .trim()
        .toUpperCase();


    const role =
        String(
            member.Role || ""
        )
        .trim()
        .toUpperCase();


    console.log(
        "Account ROLE:",
        role
    );


    console.log(
        "Account ACCESS:",
        access
    );


    /* =================================================
       ADMIN REQUIRED
       ================================================= */

    if (
        access !== "ADMIN"
    ) {

        throw new Error(
            "You do not have ADMIN access."
        );

    }


    /* =================================================
       ADMIN VERIFIED
       ================================================= */

    console.log(
        "ADMIN ACCESS VERIFIED."
    );


    displayAdmin(
        member
    );

}


/* =====================================================
   DISPLAY ADMIN
   ===================================================== */

function displayAdmin(
    member
) {

    console.log(
        "Displaying admin profile:",
        member
    );


    /* ---------------------------------------------
       PROFILE
       --------------------------------------------- */

    setText(
        "adminName",
        member.DisplayName ||
        member.Username ||
        "ADMIN"
    );


    setText(
        "adminRole",
        member.Role
    );


    setText(
        "adminAccess",
        member.Access
    );


    setText(
        "adminCountry",
        member.Country
    );


    /* ---------------------------------------------
       ADMIN INFORMATION
       --------------------------------------------- */

    setText(
        "adminMemberID",
        member.MemberID
    );


    setText(
        "adminRoleCard",
        member.Role
    );


    setText(
        "adminAccessCard",
        member.Access
    );


    /* ---------------------------------------------
       AVATAR
       --------------------------------------------- */

    const avatar =
        document.getElementById(
            "adminAvatar"
        );


    const avatarURL =
        String(
            member.AvatarURL || ""
        )
        .trim();


    if (
        avatar &&
        avatarURL !== ""
    ) {

        avatar.src =
            avatarURL;


        avatar.alt =
            member.DisplayName ||
            "Admin Avatar";


        avatar.onerror =
            function() {

                this.onerror =
                    null;

                this.src =
                    "assets/logo.png";

            };

    }


    /* ---------------------------------------------
       HIDE LOADING
       --------------------------------------------- */

    if (loading) {

        loading.style.display =
            "none";

    }


    /* ---------------------------------------------
       SHOW ADMIN DASHBOARD
       --------------------------------------------- */

    if (content) {

        content.style.display =
            "block";

    }


    console.log(
        "ADMIN DASHBOARD LOADED SUCCESSFULLY."
    );

}


/* =====================================================
   LOGOUT
   ===================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            const originalText =
                logoutBtn.textContent;


            logoutBtn.disabled =
                true;


            logoutBtn.textContent =
                "LOGGING OUT...";


            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Admin logout error:",
                    error
                );


                logoutBtn.disabled =
                    false;


                logoutBtn.textContent =
                    originalText;

            }

        }
    );

}


/* =====================================================
   END
   ===================================================== */