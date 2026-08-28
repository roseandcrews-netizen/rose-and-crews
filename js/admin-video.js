/* =====================================================
   ROSE & CREWS
   ADMIN VIDEO MANAGEMENT
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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


/* =====================================================
   GOOGLE APPS SCRIPT
   ===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbz7Alv_li574hP_wVpQX7-Ionp9Ib13rUUHOf9xc-XcFmYtusk2oxPb6ftlKthu20nJYg/exec";


/* =====================================================
   ELEMENTS
   ===================================================== */

const loading =
    document.getElementById("adminVideoLoading");

const content =
    document.getElementById("adminVideoContent");

const logoutBtn =
    document.getElementById("logoutBtn");

const videoForm =
    document.getElementById("videoForm");

const videoSubmit =
    document.getElementById("videoSubmit");

const videoResult =
    document.getElementById("videoResult");

const videosTable =
    document.getElementById("videosTable");

const refreshVideos =
    document.getElementById("refreshVideos");


/* =====================================================
   GLOBAL
   ===================================================== */

let allVideos = [];


/* =====================================================
   CLEAN VALUE
   ===================================================== */

function clean(value) {

    return String(value ?? "").trim();

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   ERROR
   ===================================================== */

function showError(message) {

    if (!loading) {

        alert(message);

        return;

    }

    loading.style.display = "block";

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

        content.style.display = "none";

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

async function verifyAdmin(firebaseUID) {

    if (loading) {

        loading.style.display = "block";

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
                    clean(firebaseUID).toLowerCase()
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

        loading.style.display = "none";

    }

    if (content) {

        content.style.display = "block";

    }

    await loadVideos();

}


/* =====================================================
   LOAD VIDEOS
   ===================================================== */

async function loadVideos() {

    if (videosTable) {

        videosTable.innerHTML =
            "LOADING VIDEOS...";

    }

    try {

        const response =
            await fetch(
                API_URL +
                "?sheet=Videos&v=" +
                Date.now(),
                {
                    method: "GET",
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
                "Unable to load Videos sheet."
            );

        }

        allVideos =
            Array.isArray(result.data)
                ? result.data
                : [];

        displayVideos(
            allVideos
        );

    } catch (error) {

        console.error(
            "LOAD VIDEOS ERROR:",
            error
        );

        if (videosTable) {

            videosTable.innerHTML = `

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
   DISPLAY VIDEOS
   ===================================================== */

function displayVideos(videos) {

    if (!videosTable) return;

    if (
        !Array.isArray(videos) ||
        videos.length === 0
    ) {

        videosTable.innerHTML = `

            <div class="dashboard-card">

                <strong>
                    NO VIDEOS FOUND
                </strong>

                <p>
                    Add your first video using the form above.
                </p>

            </div>

        `;

        return;

    }

    videosTable.innerHTML =
        videos
            .map(
                function(video, index) {

                    return createVideoCard(
                        video,
                        index
                    );

                }
            )
            .join("");

}


/* =====================================================
   CREATE VIDEO CARD
   ===================================================== */

function createVideoCard(video, index) {

    const title =
        escapeHTML(
            video.Title ||
            video.title ||
            "Untitled Video"
        );

    const url =
        clean(
            video.VideoURL ||
            video.URL ||
            video.Link
        );

    const description =
        escapeHTML(
            video.Description ||
            ""
        );

    const thumbnail =
        clean(
            video.ThumbnailURL ||
            video.Thumbnail ||
            ""
        );

    const status =
        escapeHTML(
            video.Status ||
            video.STATUS ||
            "PUBLISHED"
        );

    return `

        <div class="dashboard-card admin-video-card">

            ${
                thumbnail
                    ? `
                        <img
                            src="${escapeHTML(thumbnail)}"
                            alt="${title}"
                            style="
                                width:100%;
                                max-width:420px;
                                border-radius:12px;
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
                url
                    ? `
                        <p>

                            <a
                                href="${escapeHTML(url)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                OPEN VIDEO
                            </a>

                        </p>
                    `
                    : ""
            }

            <button
                type="button"
                class="btn primary"
                onclick="editVideo(${index})"
            >
                EDIT
            </button>

        </div>

    `;

}


/* =====================================================
   ADD VIDEO
   ===================================================== */

if (videoForm) {

    videoForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            if (videoSubmit) {

                videoSubmit.disabled = true;

                videoSubmit.textContent =
                    "SAVING...";

            }

            const formData =
                new FormData(videoForm);

            const data = {

                Title:
                    clean(
                        formData.get("Title")
                    ),

                VideoURL:
                    clean(
                        formData.get("VideoURL")
                    ),

                ThumbnailURL:
                    clean(
                        formData.get("ThumbnailURL")
                    ),

                Description:
                    clean(
                        formData.get("Description")
                    ),

                Status:
                    clean(
                        formData.get("Status")
                    ).toUpperCase()

            };

            try {

                await saveVideo(data);

                videoForm.reset();

                showResult(
                    "Video added successfully!"
                );

                await loadVideos();

            } catch (error) {

                console.error(
                    "ADD VIDEO ERROR:",
                    error
                );

                showResult(
                    "Failed: " +
                    error.message,
                    true
                );

            }

            if (videoSubmit) {

                videoSubmit.disabled = false;

                videoSubmit.textContent =
                    "ADD VIDEO";

            }

        }
    );

}


/* =====================================================
   SAVE VIDEO
   ===================================================== */

async function saveVideo(data) {

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
                            "addVideo",

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
            "Video save failed."
        );

    }

    return result;

}


/* =====================================================
   EDIT VIDEO
   ===================================================== */

window.editVideo =
    async function(index) {

        const video =
            allVideos[index];

        if (!video) {

            alert(
                "Video not found."
            );

            return;

        }

        const title =
            prompt(
                "Video Title:",
                video.Title || ""
            );

        if (title === null) return;

        const url =
            prompt(
                "Video URL:",
                video.VideoURL ||
                video.URL ||
                video.Link ||
                ""
            );

        if (url === null) return;

        const thumbnail =
            prompt(
                "Thumbnail URL:",
                video.ThumbnailURL ||
                video.Thumbnail ||
                ""
            );

        if (thumbnail === null) return;

        const description =
            prompt(
                "Description:",
                video.Description ||
                ""
            );

        if (description === null) return;

        const status =
            prompt(
                "Status (PUBLISHED / DRAFT):",
                video.Status ||
                video.STATUS ||
                "PUBLISHED"
            );

        if (status === null) return;

        const videoID =
            video.VideoID ||
            video.ID ||
            video.Id ||
            video.Title;

        try {

            if (loading) {

                loading.style.display =
                    "block";

                loading.textContent =
                    "SAVING VIDEO...";

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
                                    "updateVideo",

                                VideoID:
                                    videoID,

                                updates: {

                                    Title:
                                        title.trim(),

                                    VideoURL:
                                        url.trim(),

                                    ThumbnailURL:
                                        thumbnail.trim(),

                                    Description:
                                        description.trim(),

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
                    "Video update failed."
                );

            }

            alert(
                "Video updated successfully!"
            );

            await loadVideos();

        } catch (error) {

            console.error(
                "UPDATE VIDEO ERROR:",
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

    if (!videoResult) return;

    videoResult.style.display =
        "block";

    videoResult.innerHTML = `

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

            videoResult.style.display =
                "none";

        },
        4000
    );

}


/* =====================================================
   REFRESH
   ===================================================== */

if (refreshVideos) {

    refreshVideos.addEventListener(
        "click",
        async function() {

            refreshVideos.disabled =
                true;

            refreshVideos.textContent =
                "LOADING...";

            try {

                await loadVideos();

            } finally {

                refreshVideos.disabled =
                    false;

                refreshVideos.textContent =
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

                await signOut(auth);

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