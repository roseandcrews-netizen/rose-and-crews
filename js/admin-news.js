/* =====================================================
   ROSE & CREWS
   ADMIN NEWS MANAGEMENT
   ADD / EDIT / DELETE
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
   FIREBASE
   ===================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyDwKzLHzv45HaHhsjLgXOXZgiwJ-ntoOf4",
    authDomain: "roseandcrews-652c1.firebaseapp.com",
    projectId: "roseandcrews-652c1",
    storageBucket: "roseandcrews-652c1.firebasestorage.app",
    messagingSenderId: "701747958216",
    appId: "1:701747958216:web:4ed7c8e60303d443eeb0fd"
};

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
    document.getElementById("adminNewsLoading");

const content =
    document.getElementById("adminNewsContent");

const newsTable =
    document.getElementById("newsTable");

const newsSearch =
    document.getElementById("newsSearch");

const newsForm =
    document.getElementById("newsForm");

const saveNewsBtn =
    document.getElementById("saveNewsBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


let allNews = [];


/* =====================================================
   HELPERS
   ===================================================== */

function clean(value) {
    return String(value ?? "").trim();
}


function getField(object, wantedField) {

    if (!object || typeof object !== "object") {
        return "";
    }

    const wanted =
        clean(wantedField).toLowerCase();

    const key =
        Object.keys(object).find(key =>
            clean(key).toLowerCase() === wanted
        );

    return key === undefined
        ? ""
        : object[key] ?? "";
}


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

    if (loading) {

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
                    class="btn primary">

                    RETURN TO DASHBOARD

                </a>

            </div>
        `;
    }

    if (content) {
        content.style.display = "none";
    }
}


/* =====================================================
   FIREBASE AUTH
   ===================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            showError(
                "You are not logged in."
            );

            setTimeout(() => {
                window.location.href =
                    "login.html";
            }, 1500);

            return;
        }

        try {

            await verifyAdmin(user.uid);

        } catch (error) {

            console.error(error);

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
            "Unable to load Members."
        );
    }


    const members =
        Array.isArray(result.data)
            ? result.data
            : [];


    const member =
        members.find(item =>
            clean(
                getField(
                    item,
                    "FirebaseUID"
                )
            ).toLowerCase()
            ===
            clean(firebaseUID).toLowerCase()
        );


    if (!member) {

        throw new Error(
            "Your Firebase UID was not found in Members."
        );
    }


    if (
        clean(
            getField(
                member,
                "STATUS"
            )
        ).toUpperCase()
        !==
        "ACTIVE"
    ) {

        throw new Error(
            "Your member account is not ACTIVE."
        );
    }


    if (
        clean(
            getField(
                member,
                "Access"
            )
        ).toUpperCase()
        !==
        "ADMIN"
    ) {

        throw new Error(
            "You do not have ADMIN access."
        );
    }


    await loadNews();
}


/* =====================================================
   LOAD NEWS
   ===================================================== */

async function loadNews() {

    if (loading) {
        loading.textContent =
            "LOADING NEWS...";
    }


    const response =
        await fetch(
            API_URL +
            "?sheet=News&v=" +
            Date.now(),
            {
                method: "GET",
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            "News database returned HTTP " +
            response.status
        );
    }


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.error ||
            "Unable to load News."
        );
    }


    allNews =
        Array.isArray(result.data)
            ? result.data
            : [];


    displayNews(allNews);
}


/* =====================================================
   DISPLAY NEWS
   ===================================================== */

function displayNews(news) {

    if (!newsTable) return;


    if (!news.length) {

        newsTable.innerHTML = `
            <div class="dashboard-card">

                <h3>
                    NO NEWS FOUND
                </h3>

                <p>
                    Add your first ROSE & CREWS news article.
                </p>

            </div>
        `;

    } else {

        newsTable.innerHTML =
            news.map(createNewsCard).join("");
    }


    if (loading) {
        loading.style.display = "none";
    }

    if (content) {
        content.style.display = "block";
    }
}


/* =====================================================
   NEWS CARD
   ===================================================== */

function createNewsCard(item) {

    const id =
        clean(
            getField(item, "NewsID")
        );

    const title =
        getField(item, "Title") ||
        "UNTITLED NEWS";

    const date =
        getField(item, "Date") ||
        "—";

    const description =
        getField(item, "Description") ||
        "—";

    const image =
        clean(
            getField(item, "ImageURL")
        );


    return `
        <article
            class="dashboard-card admin-news-card">

            ${
                image
                ?
                `
                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(title)}"
                    style="
                        width:100%;
                        max-height:240px;
                        object-fit:cover;
                        border-radius:14px;
                        margin-bottom:18px;
                    "
                    onerror="
                        this.style.display='none';
                    ">
                `
                :
                ""
            }


            <h2>
                ${escapeHTML(title)}
            </h2>


            <p>
                ${escapeHTML(description)}
            </p>


            <p>
                <strong>DATE:</strong>
                ${escapeHTML(date)}
            </p>


            <p>
                <strong>NEWS ID:</strong>
                ${escapeHTML(id)}
            </p>


            <div
                style="
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                    margin-top:18px;
                ">

                <button
                    type="button"
                    class="btn primary"
                    onclick="editNews('${escapeHTML(id)}')">

                    EDIT

                </button>


                <button
                    type="button"
                    class="btn"
                    style="
                        background:#b90032;
                        border-color:#ff4965;
                    "
                    onclick="deleteNews('${escapeHTML(id)}')">

                    DELETE

                </button>

            </div>

        </article>
    `;
}


/* =====================================================
   SEARCH
   ===================================================== */

if (newsSearch) {

    newsSearch.addEventListener(
        "input",
        () => {

            const search =
                clean(
                    newsSearch.value
                ).toLowerCase();


            if (!search) {

                displayNews(allNews);

                return;
            }


            const filtered =
                allNews.filter(item => {

                    const text = [

                        getField(
                            item,
                            "NewsID"
                        ),

                        getField(
                            item,
                            "Title"
                        ),

                        getField(
                            item,
                            "Description"
                        ),

                        getField(
                            item,
                            "Date"
                        )

                    ]
                    .join(" ")
                    .toLowerCase();


                    return text.includes(search);
                });


            displayNews(filtered);
        }
    );
}


/* =====================================================
   ADD NEWS
   ===================================================== */

if (newsForm) {

    newsForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const title =
                document
                    .getElementById("newsTitle")
                    .value
                    .trim();


            const date =
                document
                    .getElementById("newsDate")
                    .value
                    .trim();


            const imageURL =
                document
                    .getElementById("newsImage")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("newsDescription")
                    .value
                    .trim();


            if (!title || !date || !description) {

                alert(
                    "Please fill in all required fields."
                );

                return;
            }


            saveNewsBtn.disabled = true;

            saveNewsBtn.textContent =
                "ADDING NEWS...";


            try {

                const result =
                    await postAPI({

                        action:
                            "addNews",

                        data: {

                            Title:
                                title,

                            Date:
                                date,

                            ImageURL:
                                imageURL,

                            Description:
                                description
                        }
                    });


                if (!result.success) {

                    throw new Error(
                        result.error ||
                        "Unable to add news."
                    );
                }


                alert(
                    "✓ News added successfully!"
                );


                newsForm.reset();


                await loadNews();

            } catch (error) {

                console.error(error);

                alert(
                    "Add failed:\n\n" +
                    error.message
                );

            } finally {

                saveNewsBtn.disabled = false;

                saveNewsBtn.textContent =
                    "ADD NEWS";
            }
        }
    );
}


/* =====================================================
   EDIT NEWS
   ===================================================== */

window.editNews =
    async function(newsID) {

        const news =
            allNews.find(item =>
                clean(
                    getField(
                        item,
                        "NewsID"
                    )
                ) === clean(newsID)
            );


        if (!news) {

            alert(
                "News item not found."
            );

            return;
        }


        const title =
            prompt(
                "News Title:",
                getField(
                    news,
                    "Title"
                )
            );

        if (title === null) return;


        const date =
            prompt(
                "Date:",
                getField(
                    news,
                    "Date"
                )
            );

        if (date === null) return;


        const description =
            prompt(
                "Description:",
                getField(
                    news,
                    "Description"
                )
            );

        if (description === null) return;


        const imageURL =
            prompt(
                "Image URL:",
                getField(
                    news,
                    "ImageURL"
                )
            );

        if (imageURL === null) return;


        await saveNews(
            newsID,
            {
                Title:
                    title.trim(),

                Date:
                    date.trim(),

                Description:
                    description.trim(),

                ImageURL:
                    imageURL.trim()
            }
        );
    };


/* =====================================================
   UPDATE NEWS
   ===================================================== */

async function saveNews(
    newsID,
    updates
) {

    try {

        const result =
            await postAPI({

                action:
                    "updateNews",

                NewsID:
                    newsID,

                updates:
                    updates
            });


        if (!result.success) {

            throw new Error(
                result.error ||
                "News update failed."
            );
        }


        alert(
            "✓ News updated successfully!"
        );


        await loadNews();

    } catch (error) {

        console.error(error);

        alert(
            "Update failed:\n\n" +
            error.message
        );
    }
}


/* =====================================================
   DELETE NEWS
   ===================================================== */

window.deleteNews =
    async function(newsID) {

        const news =
            allNews.find(item =>
                clean(
                    getField(
                        item,
                        "NewsID"
                    )
                ) === clean(newsID)
            );


        const title =
            news
            ?
            getField(
                news,
                "Title"
            )
            :
            newsID;


        const confirmed =
            confirm(
                `Delete this news article?\n\n"${title}"\n\nThis cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const result =
                await postAPI({

                    action:
                        "deleteNews",

                    NewsID:
                        newsID
                });


            if (!result.success) {

                throw new Error(
                    result.error ||
                    "News deletion failed."
                );
            }


            alert(
                "✓ News deleted successfully!"
            );


            await loadNews();

        } catch (error) {

            console.error(error);

            alert(
                "Delete failed:\n\n" +
                error.message
            );
        }
    };


/* =====================================================
   GOOGLE APPS SCRIPT POST
   ===================================================== */

async function postAPI(data) {

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
                    JSON.stringify(data)
            }
        );


    if (!response.ok) {

        throw new Error(
            "Server returned HTTP " +
            response.status
        );
    }


    return await response.json();
}


/* =====================================================
   LOGOUT
   ===================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(error);

                alert(
                    "Logout failed."
                );
            }
        }
    );
}