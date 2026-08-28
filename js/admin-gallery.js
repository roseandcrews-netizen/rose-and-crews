/* =====================================================
   ROSE & CREWS
   ADMIN GALLERY MANAGEMENT
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
        "adminGalleryLoading"
    );


const content =
    document.getElementById(
        "adminGalleryContent"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const galleryForm =
    document.getElementById(
        "galleryForm"
    );


const gallerySubmit =
    document.getElementById(
        "gallerySubmit"
    );


const galleryResult =
    document.getElementById(
        "galleryResult"
    );


const galleryTable =
    document.getElementById(
        "galleryTable"
    );


const refreshGallery =
    document.getElementById(
        "refreshGallery"
    );



/* =====================================================
   GLOBAL
   ===================================================== */

let allGallery = [];



/* =====================================================
   CLEAN
   ===================================================== */

function clean(value) {

    return String(
        value ?? ""
    ).trim();

}



/* =====================================================
   ESCAPE HTML
   ===================================================== */

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
   ERROR
   ===================================================== */

function showError(message) {

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
   FIREBASE AUTH
   ===================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        console.log(
            "Firebase user:",
            user
        );


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


        try {

            await verifyAdmin(
                user.uid
            );

        } catch (error) {

            console.error(
                "ADMIN VERIFICATION ERROR:",
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


    const response =
        await fetch(
            API_URL +
            "?sheet=Members&v=" +
            Date.now(),
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


    if (!result.success) {

        throw new Error(
            result.error ||
            "Unable to load Members sheet."
        );

    }


    if (!Array.isArray(result.data)) {

        throw new Error(
            "Invalid Members data."
        );

    }


    const members =
        result.data;


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


    const status =
        clean(
            currentMember.STATUS ||
            currentMember.Status
        ).toUpperCase();


    if (status !== "ACTIVE") {

        throw new Error(
            "Your ROSE & CREWS member account is not ACTIVE."
        );

    }


    const access =
        clean(
            currentMember.Access
        ).toUpperCase();


    if (access !== "ADMIN") {

        throw new Error(
            "You do not have ADMIN access."
        );

    }


    console.log(
        "ADMIN VERIFIED"
    );


    if (loading) {

        loading.style.display =
            "none";

    }


    if (content) {

        content.style.display =
            "block";

    }


    await loadGallery();

}



/* =====================================================
   LOAD GALLERY
   ===================================================== */

async function loadGallery() {

    if (galleryTable) {

        galleryTable.innerHTML =
            "LOADING GALLERY...";

    }


    try {

        const response =
            await fetch(
                API_URL +
                "?sheet=Gallery&v=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.error ||
                "Unable to load Gallery sheet."
            );

        }


        allGallery =
            Array.isArray(result.data)
                ? result.data
                : [];


        displayGallery(
            allGallery
        );


    } catch (error) {

        console.error(
            "LOAD GALLERY ERROR:",
            error
        );


        if (galleryTable) {

            galleryTable.innerHTML = `

                <div class="dashboard-error">

                    <div style="font-size:40px;">
                        ⚠️
                    </div>

                    <p>
                        ${escapeHTML(error.message)}
                    </p>

                </div>

            `;

        }

    }

}



/* =====================================================
   DISPLAY GALLERY
   ===================================================== */

function displayGallery(
    gallery
) {

    if (!galleryTable) return;


    if (
        !Array.isArray(gallery) ||
        gallery.length === 0
    ) {

        galleryTable.innerHTML = `

            <div class="dashboard-card">

                <strong>
                    NO GALLERY IMAGES FOUND
                </strong>

                <p>
                    Add your first gallery image using the form above.
                </p>

            </div>

        `;

        return;

    }


    galleryTable.innerHTML =
        gallery
            .map(
                function(item, index) {

                    return createGalleryCard(
                        item,
                        index
                    );

                }
            )
            .join("");

}



/* =====================================================
   CREATE GALLERY CARD
   ===================================================== */

function createGalleryCard(
    item,
    index
) {

    const title =
        escapeHTML(
            item.Title ||
            item.title ||
            "Untitled Image"
        );


    const imageURL =
        clean(
            item.ImageURL ||
            item.imageURL ||
            item.Image ||
            item.URL
        );


    const description =
        escapeHTML(
            item.Description ||
            ""
        );


    const category =
        escapeHTML(
            item.Category ||
            ""
        );


    const status =
        escapeHTML(
            item.Status ||
            item.STATUS ||
            "PUBLISHED"
        );


    return `

        <div class="dashboard-card admin-gallery-card">


            ${
                imageURL
                    ? `

                        <img
                            src="${escapeHTML(imageURL)}"
                            alt="${title}"
                            style="
                                width:100%;
                                max-width:500px;
                                max-height:320px;
                                object-fit:cover;
                                border-radius:14px;
                                display:block;
                                margin-bottom:15px;
                            "
                            onerror="
                                this.style.display='none';
                            "
                        >

                    `
                    : ""
            }


            <h3>
                ${title}
            </h3>


            ${
                category
                    ? `

                        <p>

                            <strong>
                                CATEGORY:
                            </strong>

                            ${category}

                        </p>

                    `
                    : ""
            }


            ${
                description
                    ? `

                        <p>
                            ${description}
                        </p>

                    `
                    : ""
            }


            <p>

                <strong>
                    STATUS:
                </strong>

                ${status}

            </p>


            ${
                imageURL
                    ? `

                        <p>

                            <a
                                href="${escapeHTML(imageURL)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                OPEN IMAGE
                            </a>

                        </p>

                    `
                    : ""
            }


            <button
                type="button"
                class="btn primary"
                onclick="editGallery(${index})"
            >
                EDIT
            </button>


        </div>

    `;

}



/* =====================================================
   ADD GALLERY IMAGE
   ===================================================== */

if (galleryForm) {

    galleryForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (gallerySubmit) {

                gallerySubmit.disabled =
                    true;

                gallerySubmit.textContent =
                    "SAVING...";

            }


            const formData =
                new FormData(
                    galleryForm
                );


            const data = {

                Title:
                    clean(
                        formData.get(
                            "Title"
                        )
                    ),

                ImageURL:
                    clean(
                        formData.get(
                            "ImageURL"
                        )
                    ),

                Description:
                    clean(
                        formData.get(
                            "Description"
                        )
                    ),

                Category:
                    clean(
                        formData.get(
                            "Category"
                        )
                    ),

                Status:
                    clean(
                        formData.get(
                            "Status"
                        )
                    ).toUpperCase()

            };


            try {

                await saveGallery(
                    data
                );


                galleryForm.reset();


                showResult(
                    "Gallery image added successfully!"
                );


                await loadGallery();


            } catch (error) {

                console.error(
                    "ADD GALLERY ERROR:",
                    error
                );


                showResult(
                    "Failed: " +
                    error.message,
                    true
                );

            }


            if (gallerySubmit) {

                gallerySubmit.disabled =
                    false;

                gallerySubmit.textContent =
                    "ADD IMAGE";

            }

        }
    );

}



/* =====================================================
   SAVE GALLERY
   ===================================================== */

async function saveGallery(
    data
) {

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
                            "addGallery",

                        data:
                            data

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


    if (!result.success) {

        throw new Error(
            result.error ||
            "Gallery save failed."
        );

    }


    return result;

}



/* =====================================================
   EDIT GALLERY
   ===================================================== */

window.editGallery =
    async function(index) {

        const item =
            allGallery[index];


        if (!item) {

            alert(
                "Gallery item not found."
            );

            return;

        }


        const title =
            prompt(
                "Gallery Title:",
                item.Title ||
                ""
            );


        if (title === null) return;


        const imageURL =
            prompt(
                "Image URL:",
                item.ImageURL ||
                item.imageURL ||
                item.Image ||
                ""
            );


        if (imageURL === null) return;


        const description =
            prompt(
                "Description:",
                item.Description ||
                ""
            );


        if (description === null) return;


        const category =
            prompt(
                "Category:",
                item.Category ||
                ""
            );


        if (category === null) return;


        const status =
            prompt(
                "Status (PUBLISHED / DRAFT):",
                item.Status ||
                item.STATUS ||
                "PUBLISHED"
            );


        if (status === null) return;


        const galleryID =
            item.GalleryID ||
            item.ID ||
            item.Id ||
            item.Title;


        try {

            if (loading) {

                loading.style.display =
                    "block";

                loading.textContent =
                    "SAVING GALLERY...";

            }


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
                                    "updateGallery",

                                GalleryID:
                                    galleryID,

                                updates: {

                                    Title:
                                        title.trim(),

                                    ImageURL:
                                        imageURL.trim(),

                                    Description:
                                        description.trim(),

                                    Category:
                                        category.trim(),

                                    Status:
                                        status
                                            .trim()
                                            .toUpperCase()

                                }

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


            if (!result.success) {

                throw new Error(
                    result.error ||
                    "Gallery update failed."
                );

            }


            alert(
                "Gallery image updated successfully!"
            );


            await loadGallery();


        } catch (error) {

            console.error(
                "UPDATE GALLERY ERROR:",
                error
            );


            alert(
                "Update failed:\n\n" +
                error.message
            );

        } finally {

            if (loading) {

                loading.style.display =
                    "none";

            }

        }

    };



/* =====================================================
   RESULT MESSAGE
   ===================================================== */

function showResult(
    message,
    error = false
) {

    if (!galleryResult) return;


    galleryResult.style.display =
        "block";


    galleryResult.innerHTML = `

        <div
            class="${
                error
                    ? "login-error"
                    : "login-success"
            }"
        >

            <strong>
                ${escapeHTML(message)}
            </strong>

        </div>

    `;


    setTimeout(
        function() {

            galleryResult.style.display =
                "none";

        },
        4000
    );

}



/* =====================================================
   REFRESH
   ===================================================== */

if (refreshGallery) {

    refreshGallery.addEventListener(
        "click",
        async function() {

            refreshGallery.disabled =
                true;

            refreshGallery.textContent =
                "LOADING...";


            try {

                await loadGallery();

            } finally {

                refreshGallery.disabled =
                    false;

                refreshGallery.textContent =
                    "REFRESH";

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

            try {

                logoutBtn.disabled =
                    true;

                logoutBtn.textContent =
                    "LOGGING OUT...";


                await signOut(
                    auth
                );


                localStorage.removeItem(
                    "roseCrewsFirebaseUID"
                );


                localStorage.removeItem(
                    "roseCrewsUserEmail"
                );


                window.location.href =
                    "login.html";


            } catch (error) {

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