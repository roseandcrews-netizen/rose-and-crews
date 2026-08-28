/* =====================================================
   ROSE & CREWS
   ADMIN SETTINGS
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
   GOOGLE APPS SCRIPT
   ===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbz7Alv_li574hP_wVpQX7-Ionp9Ib13rUUHOf9xc-XcFmYtusk2oxPb6ftlKthu20nJYg/exec";



/* =====================================================
   ELEMENTS
   ===================================================== */

const loading =
    document.getElementById(
        "adminSettingsLoading"
    );


const content =
    document.getElementById(
        "adminSettingsContent"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const saveSettingsBtn =
    document.getElementById(
        "saveSettingsBtn"
    );


const settingsResult =
    document.getElementById(
        "settingsResult"
    );



/* =====================================================
   HELPERS
   ===================================================== */

function clean(value) {

    return String(
        value ?? ""
    ).trim();

}



function escapeHTML(value) {

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
        document.getElementById(id);


    if (!element) return;


    element.textContent =
        clean(value) || "—";

}



/* =====================================================
   SHOW ERROR
   ===================================================== */

function showError(
    message
) {

    if (!loading) {

        alert(message);

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
                class="btn primary"
            >
                RETURN TO DASHBOARD
            </a>

        </div>

    `;


    if (content) {

        content.style.display =
            "none";

    }

}



/* =====================================================
   AUTH STATE
   ===================================================== */

onAuthStateChanged(

    auth,

    async function(user) {

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
           VERIFY ADMIN
           --------------------------------------------- */

        try {

            await verifyAdmin(
                user.uid
            );

        }

        catch (error) {

            console.error(
                "ADMIN ERROR:",
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


    const url =
        API_URL +
        "?sheet=Members&v=" +
        Date.now();


    const response =
        await fetch(

            url,

            {

                method: "GET",

                cache: "no-store"

            }

        );


    if (!response.ok) {

        throw new Error(

            "Members database returned HTTP " +
            response.status

        );

    }


    const result =
        await response.json();


    console.log(
        "Members API:",
        result
    );


    if (!result.success) {

        throw new Error(

            result.error ||
            "Unable to load Members sheet."

        );

    }


    if (
        !Array.isArray(
            result.data
        )
    ) {

        throw new Error(
            "Invalid Members data."
        );

    }


    const members =
        result.data;


    /* ---------------------------------------------
       FIND CURRENT MEMBER
       --------------------------------------------- */

    const currentMember =
        members.find(

            function(member) {

                const sheetUID =
                    clean(
                        member.FirebaseUID
                    ).toLowerCase();


                return (

                    sheetUID ===
                    clean(
                        firebaseUID
                    ).toLowerCase()

                );

            }

        );


    if (!currentMember) {

        throw new Error(

            "Your Firebase UID was not found in the Members sheet."

        );

    }


    /* ---------------------------------------------
       STATUS
       --------------------------------------------- */

    const status =
        clean(
            currentMember.STATUS ||
            currentMember.Status
        )
        .toUpperCase();


    if (
        status !==
        "ACTIVE"
    ) {

        throw new Error(

            "Your ROSE & CREWS member account is not ACTIVE."

        );

    }


    /* ---------------------------------------------
       ACCESS
       --------------------------------------------- */

    const access =
        clean(
            currentMember.Access
        )
        .toUpperCase();


    if (
        access !==
        "ADMIN"
    ) {

        throw new Error(
            "You do not have ADMIN access."
        );

    }


    /* ---------------------------------------------
       ADMIN INFORMATION
       --------------------------------------------- */

    setText(

        "adminName",

        currentMember.DisplayName ||
        currentMember.Username ||
        "ADMIN"

    );


    setText(

        "adminRole",

        currentMember.Role

    );


    setText(

        "adminAccess",

        currentMember.Access

    );


    setText(

        "adminMemberID",

        currentMember.MemberID

    );


    /* ---------------------------------------------
       LOAD SETTINGS
       --------------------------------------------- */

    await loadSettings();


    /* ---------------------------------------------
       SHOW PAGE
       --------------------------------------------- */

    if (loading) {

        loading.style.display =
            "none";

    }


    if (content) {

        content.style.display =
            "block";

    }


    console.log(
        "ADMIN SETTINGS LOADED"
    );

}



/* =====================================================
   LOAD SETTINGS
   ===================================================== */

async function loadSettings() {

    try {

        const response =
            await fetch(

                API_URL +
                "?sheet=Settings&v=" +
                Date.now(),

                {

                    method: "GET",

                    cache: "no-store"

                }

            );


        if (!response.ok) {

            throw new Error(
                "Settings request failed."
            );

        }


        const result =
            await response.json();


        console.log(
            "Settings API:",
            result
        );


        if (!result.success) {

            throw new Error(

                result.error ||
                "Unable to load Settings."

            );

        }


        if (
            !Array.isArray(
                result.data
            )
        ) {

            return;

        }


        const settings =
            result.data;


        /*
         * Supports a Settings sheet
         * with Key / Value columns.
         */

        settings.forEach(

            function(item) {

                const key =
                    clean(
                        item.Key ||
                        item.key ||
                        item.Setting
                    ).toLowerCase();


                const value =
                    item.Value ??
                    item.value ??
                    "";


                if (
                    key ===
                    "sitename"
                ) {

                    document.getElementById(
                        "siteName"
                    ).value =
                        value;

                }


                if (
                    key ===
                    "sitedescription"
                ) {

                    document.getElementById(
                        "siteDescription"
                    ).value =
                        value;

                }


                if (
                    key ===
                    "discordurl"
                ) {

                    document.getElementById(
                        "discordURL"
                    ).value =
                        value;

                }


                if (
                    key ===
                    "contactemail"
                ) {

                    document.getElementById(
                        "contactEmail"
                    ).value =
                        value;

                }

            }

        );


    }

    catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );

        /*
         * Settings are optional.
         * Admin page can still open.
         */

    }

}



/* =====================================================
   SAVE SETTINGS
   ===================================================== */

if (saveSettingsBtn) {

    saveSettingsBtn.addEventListener(

        "click",

        async function() {

            const settings = {

                SiteName:

                    clean(
                        document.getElementById(
                            "siteName"
                        ).value
                    ),


                SiteDescription:

                    clean(
                        document.getElementById(
                            "siteDescription"
                        ).value
                    ),


                DiscordURL:

                    clean(
                        document.getElementById(
                            "discordURL"
                        ).value
                    ),


                ContactEmail:

                    clean(
                        document.getElementById(
                            "contactEmail"
                        ).value
                    )

            };


            saveSettingsBtn.disabled =
                true;


            saveSettingsBtn.textContent =
                "SAVING...";


            if (settingsResult) {

                settingsResult.style.display =
                    "none";

            }


            try {

                const response =
                    await fetch(

                        API_URL,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "text/plain;charset=utf-8"

                            },

                            body:

                                JSON.stringify({

                                    action:
                                        "updateSettings",

                                    settings:
                                        settings

                                })

                        }

                    );


                if (!response.ok) {

                    throw new Error(

                        "Server returned HTTP " +
                        response.status

                    );

                }


                const result =
                    await response.json();


                console.log(
                    "SAVE SETTINGS RESULT:",
                    result
                );


                if (!result.success) {

                    throw new Error(

                        result.error ||
                        "Settings update failed."

                    );

                }


                if (settingsResult) {

                    settingsResult.style.display =
                        "block";


                    settingsResult.innerHTML = `

                        <div class="join-success">

                            <div class="join-success-icon">
                                ✓
                            </div>

                            <strong>
                                SETTINGS SAVED SUCCESSFULLY
                            </strong>

                        </div>

                    `;

                }

                else {

                    alert(
                        "Settings saved successfully!"
                    );

                }


            }

            catch (error) {

                console.error(
                    "SAVE SETTINGS ERROR:",
                    error
                );


                if (settingsResult) {

                    settingsResult.style.display =
                        "block";


                    settingsResult.innerHTML = `

                        <div class="login-error">

                            <span>
                                ⚠
                            </span>

                            <strong>
                                ${escapeHTML(
                                    error.message
                                )}
                            </strong>

                        </div>

                    `;

                }

                else {

                    alert(
                        "Save failed:\n\n" +
                        error.message
                    );

                }

            }

            finally {

                saveSettingsBtn.disabled =
                    false;


                saveSettingsBtn.textContent =
                    "SAVE SETTINGS";

            }

        }

    );

}



/* =====================================================
   LOGOUT
   ===================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(

        "click",

        async function() {

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

            }

            catch (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );


                logoutBtn.disabled =
                    false;


                logoutBtn.textContent =
                    "LOGOUT";

            }

        }

    );

}