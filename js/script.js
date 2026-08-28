/* =====================================================
   ROSE & CREWS
   CLEAN MAIN WEBSITE SCRIPT
   ===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbz7Alv_li574hP_wVpQX7-Ionp9Ib13rUUHOf9xc-XcFmYtusk2oxPb6ftlKthu20nJYg/exec";


/* =====================================================
   HELPERS
   ===================================================== */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function clean(value) {
    return String(value ?? "").trim();
}


function validURL(value) {
    const url = clean(value);

    return (
        url !== "" &&
        url.toLowerCase() !== "n/a" &&
        url.toLowerCase() !== "na"
    );
}


/* =====================================================
   DATE FORMAT
   ===================================================== */

function formatDate(value) {

    if (!value) {
        return "";
    }

    const text = clean(value);

    if (!text) {
        return "";
    }

    let date;

    /* Google Sheets ISO date */

    if (
        text.includes("T") &&
        !isNaN(Date.parse(text))
    ) {

        date = new Date(text);

    } else {

        date = new Date(text);

    }


    if (isNaN(date.getTime())) {

        return text;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================================
   TIME FORMAT
   ===================================================== */

function formatTime(value) {

    if (!value) {
        return "";
    }

    const text = clean(value);

    if (!text) {
        return "";
    }


    /*
     * If Google Sheets sends a full ISO date/time,
     * extract only the time.
     */

    if (
        text.includes("T") &&
        !isNaN(Date.parse(text))
    ) {

        const date = new Date(text);

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );
    }


    /*
     * Google Sheets sometimes sends:
     *
     * 1899-12-29T18:38:50.000Z
     *
     * This is actually a TIME value.
     */

    if (
        text.startsWith("1899-") ||
        text.startsWith("1900-")
    ) {

        const date = new Date(text);

        if (!isNaN(date.getTime())) {

            return date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "UTC"
                }
            );
        }
    }


    /*
     * Normal time such as:
     *
     * 18:30
     * 18:30:00
     */

    const match =
        text.match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
        );


    if (match) {

        let hour =
            parseInt(match[1], 10);

        const minute =
            match[2];

        const ampm =
            hour >= 12
                ? "PM"
                : "AM";

        hour =
            hour % 12 || 12;

        return (
            hour +
            ":" +
            minute +
            " " +
            ampm
        );
    }


    return text;
}


/* =====================================================
   GOOGLE SHEETS API
   ===================================================== */

async function getData(sheet) {

    try {

        const response =
            await fetch(
                API_URL +
                "?sheet=" +
                encodeURIComponent(sheet)
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
                "API error"
            );

        }


        return Array.isArray(result.data)
            ? result.data
            : [];


    } catch (error) {

        console.error(
            "ROSE & CREWS - " +
            sheet +
            " ERROR:",
            error
        );

        return [];

    }
}


/* =====================================================
   GLOBAL AUTH NAV
   ===================================================== */

async function setupGlobalAuthNav() {

    const loginButtons =
        document.querySelectorAll(
            ".login-btn"
        );


    if (!loginButtons.length) {
        return;
    }


    try {

        const firebase =
            await import(
                "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"
            );


        const firebaseAuth =
            await import(
                "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js"
            );


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


        let app;


        try {

            app =
                firebase.getApp();

        } catch (error) {

            app =
                firebase.initializeApp(
                    firebaseConfig
                );

        }


        const auth =
            firebaseAuth.getAuth(app);


        firebaseAuth.onAuthStateChanged(
            auth,
            function (user) {

                loginButtons.forEach(
                    function (button) {

                        if (user) {

                            button.textContent =
                                "DASHBOARD";

                            button.setAttribute(
                                "href",
                                "dashboard.html"
                            );

                            button.classList.remove(
                                "active"
                            );

                        } else {

                            button.textContent =
                                "LOGIN";

                            button.setAttribute(
                                "href",
                                "login.html"
                            );

                        }

                    }
                );

            }
        );


    } catch (error) {

        console.error(
            "ROSE & CREWS AUTH NAV ERROR:",
            error
        );

    }
}


setupGlobalAuthNav();


/* =====================================================
   MOBILE MENU
   ===================================================== */

function setupMobileMenu() {

    const button =
        document.querySelector(
            ".menu-toggle"
        );


    const nav =
        document.querySelector(
            ".nav-links"
        );


    if (!button || !nav) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            nav.classList.toggle(
                "mobile-open"
            );


            button.textContent =
                nav.classList.contains(
                    "mobile-open"
                )
                    ? "✕"
                    : "☰";

        }
    );


    nav.querySelectorAll("a")
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        nav.classList.remove(
                            "mobile-open"
                        );

                        button.textContent =
                            "☰";

                    }
                );

            }
        );
}


/* =====================================================
   HOME NEWS
   ===================================================== */

async function loadHomeNews() {

    const container =
        document.getElementById(
            "homeNewsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<div class='home-loading'>LOADING NEWS...</div>";


    const data =
        await getData("News");


    const news =
        data.filter(
            function (item) {

                const status =
                    clean(
                        item.Status
                    ).toLowerCase();


                return (
                    status === "" ||
                    status === "published" ||
                    status === "publised"
                );

            }
        );


    if (!news.length) {

        container.innerHTML =
            "<div class='home-loading'>NO NEWS AVAILABLE</div>";

        return;
    }


    container.innerHTML = "";


    news.slice(0, 2)
        .forEach(
            function (item) {

                const card =
                    document.createElement(
                        "a"
                    );


                card.href =
                    "news.html";


                card.className =
                    "home-news-card";


                if (
                    validURL(
                        item.ImageURL
                    )
                ) {

                    const img =
                        document.createElement(
                            "img"
                        );


                    img.src =
                        clean(
                            item.ImageURL
                        );


                    img.alt =
                        clean(
                            item.Title
                        ) ||
                        "News";


                    img.className =
                        "home-news-image";


                    img.loading =
                        "lazy";


                    card.appendChild(
                        img
                    );

                }


                const content =
                    document.createElement(
                        "div"
                    );


                content.className =
                    "home-news-content";


                content.innerHTML = `

                    <div class="home-news-category">
                        NEWS
                    </div>

                    <div class="home-news-date">

                        ${escapeHTML(
                            formatDate(
                                item.PublishDate
                            )
                        )}

                        &nbsp; • &nbsp;

                        ${escapeHTML(
                            item.Author ||
                            "ROSE & CREWS"
                        )}

                    </div>

                    <h3 class="home-news-title">

                        ${escapeHTML(
                            item.Title ||
                            "Untitled News"
                        )}

                    </h3>

                    <p class="home-news-description">

                        ${escapeHTML(
                            item.Description ||
                            ""
                        )}

                    </p>

                `;


                card.appendChild(
                    content
                );


                container.appendChild(
                    card
                );

            }
        );
}


/* =====================================================
   HOME EVENTS
   ===================================================== */

async function loadHomeEvents() {

    const container =
        document.getElementById(
            "homeEventsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<div class='home-loading'>LOADING EVENTS...</div>";


    const events =
        await getData("Events");


    if (!events.length) {

        container.innerHTML =
            "<div class='home-loading'>NO UPCOMING EVENTS</div>";

        return;
    }


    container.innerHTML = "";


    events.slice(0, 2)
        .forEach(
            function (item) {

                const card =
                    document.createElement(
                        "a"
                    );


                card.href =
                    "events.html";


                card.className =
                    "home-event-card";


                if (
                    validURL(
                        item.BannerURL
                    )
                ) {

                    const img =
                        document.createElement(
                            "img"
                        );


                    img.src =
                        clean(
                            item.BannerURL
                        );


                    img.alt =
                        clean(
                            item.Title
                        ) ||
                        "Event";


                    img.className =
                        "home-event-image";


                    img.loading =
                        "lazy";


                    card.appendChild(
                        img
                    );

                }


                const content =
                    document.createElement(
                        "div"
                    );


                content.className =
                    "home-event-content";


                const eventDate =
                    formatDate(
                        item.Date
                    );


                const eventTime =
                    formatTime(
                        item.Time
                    );


                content.innerHTML = `

                    <div class="home-event-status">
                        EVENT
                    </div>

                    <h3 class="home-event-title">

                        ${escapeHTML(
                            item.Title ||
                            "Upcoming Event"
                        )}

                    </h3>

                    <div class="home-event-info">

                        ${escapeHTML(
                            eventDate ||
                            "N/A"
                        )}

                        ${
                            eventTime
                                ? " • " +
                                  escapeHTML(
                                      eventTime
                                  )
                                : ""
                        }

                        <br>

                        ${escapeHTML(
                            item.Departure ||
                            "N/A"
                        )}

                        →

                        ${escapeHTML(
                            item.Destination ||
                            "N/A"
                        )}

                    </div>

                `;


                card.appendChild(
                    content
                );


                container.appendChild(
                    card
                );

            }
        );
}


/* =====================================================
   HOME MEMBERS
   ===================================================== */

async function loadHomeMembers() {

    const container =
        document.getElementById(
            "homeMembersContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<div class='home-loading'>LOADING MEMBERS...</div>";


    const members =
        await getData("Members");


    const active =
        members.filter(
            function (item) {

                const status =
                    clean(
                        item.Status
                    ).toLowerCase();


                return (
                    status === "" ||
                    status === "active"
                );

            }
        );


    if (!active.length) {

        container.innerHTML =
            "<div class='home-loading'>NO MEMBERS AVAILABLE</div>";

        return;
    }


    container.innerHTML = "";


    active.slice(0, 4)
        .forEach(
            function (item) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "home-member-card";


                if (
                    validURL(
                        item.AvatarURL
                    )
                ) {

                    const img =
                        document.createElement(
                            "img"
                        );


                    img.src =
                        clean(
                            item.AvatarURL
                        );


                    img.alt =
                        clean(
                            item.DisplayName
                        ) ||
                        clean(
                            item.Username
                        ) ||
                        "Member";


                    img.className =
                        "home-member-avatar";


                    img.loading =
                        "lazy";


                    card.appendChild(
                        img
                    );

                } else {

                    const avatar =
                        document.createElement(
                            "div"
                        );


                    avatar.className =
                        "home-member-avatar home-member-avatar-empty";


                    avatar.textContent =
                        (
                            clean(
                                item.DisplayName
                            ) ||
                            clean(
                                item.Username
                            ) ||
                            "M"
                        )
                        .charAt(0)
                        .toUpperCase();


                    card.appendChild(
                        avatar
                    );

                }


                const content =
                    document.createElement(
                        "div"
                    );


                content.innerHTML = `

                    <div class="home-member-name">

                        ${escapeHTML(
                            item.DisplayName ||
                            item.Username ||
                            "Member"
                        )}

                    </div>

                    <div class="home-member-role">

                        ${escapeHTML(
                            item.Role ||
                            "MEMBER"
                        )}

                    </div>

                    <div class="home-member-country">

                        ${escapeHTML(
                            item.Country ||
                            ""
                        )}

                    </div>

                `;


                card.appendChild(
                    content
                );


                container.appendChild(
                    card
                );

            }
        );
}


/* =====================================================
   NEWS PAGE
   ===================================================== */

async function loadNews() {

    const container =
        document.getElementById(
            "newsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<div class='news-loading'>LOADING NEWS...</div>";


    const data =
        await getData("News");


    const news =
        data.filter(
            function (item) {

                const status =
                    clean(
                        item.Status
                    ).toLowerCase();


                return (
                    status === "" ||
                    status === "published" ||
                    status === "publised"
                );

            }
        );


    if (!news.length) {

        container.innerHTML =
            "<div class='news-loading'>NO PUBLISHED NEWS</div>";

        return;
    }


    container.innerHTML = "";


    news.forEach(
        function (item) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "news-card";


            if (
                validURL(
                    item.ImageURL
                )
            ) {

                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    clean(
                        item.ImageURL
                    );


                img.alt =
                    clean(
                        item.Title
                    ) ||
                    "News";


                img.className =
                    "news-image";


                img.loading =
                    "lazy";


                card.appendChild(
                    img
                );

            }


            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "news-content";


            content.innerHTML = `

                <div class="news-category">
                    NEWS
                </div>

                <div class="news-date">

                    ${escapeHTML(
                        formatDate(
                            item.PublishDate
                        )
                    )}

                    &nbsp; • &nbsp;

                    ${escapeHTML(
                        item.Author ||
                        "ROSE & CREWS"
                    )}

                </div>

                <h2 class="news-title">

                    ${escapeHTML(
                        item.Title ||
                        "Untitled News"
                    )}

                </h2>

                <p class="news-description">

                    ${escapeHTML(
                        item.Description ||
                        ""
                    )}

                </p>

            `;


            card.appendChild(
                content
            );


            container.appendChild(
                card
            );

        }
    );
}


/* =====================================================
   EVENTS PAGE
   ===================================================== */

async function loadEvents() {

    const container =
        document.getElementById(
            "eventsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<div class='events-loading'>LOADING EVENTS...</div>";


    const events =
        await getData("Events");


    if (!events.length) {

        container.innerHTML =
            "<div class='events-loading'>NO EVENTS AVAILABLE</div>";

        return;
    }


    container.innerHTML = "";


    events.forEach(
        function (item) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "event-card";


            if (
                validURL(
                    item.BannerURL
                )
            ) {

                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    clean(
                        item.BannerURL
                    );


                img.alt =
                    clean(
                        item.Title
                    ) ||
                    "Event";


                img.className =
                    "event-image";


                img.loading =
                    "lazy";


                card.appendChild(
                    img
                );

            }


            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "event-content";


            const eventDate =
                formatDate(
                    item.Date
                );


            const eventTime =
                formatTime(
                    item.Time
                );


            content.innerHTML = `

                <div class="event-status">
                    EVENT
                </div>

                <h2 class="event-title">

                    ${escapeHTML(
                        item.Title ||
                        "Event"
                    )}

                </h2>

                <p class="event-info">

                    ${escapeHTML(
                        eventDate ||
                        "N/A"
                    )}

                    ${
                        eventTime
                            ? " • " +
                              escapeHTML(
                                  eventTime
                              )
                            : ""
                    }

                </p>

                <p class="event-route">

                    ${escapeHTML(
                        item.Departure ||
                        "N/A"
                    )}

                    →

                    ${escapeHTML(
                        item.Destination ||
                        "N/A"
                    )}

                </p>

            `;


            card.appendChild(
                content
            );


            container.appendChild(
                card
            );

        }
    );
}


/* =====================================================
   GALLERY
   ===================================================== */

async function loadGallery() {

    const container =
        document.getElementById(
            "galleryContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<div class='gallery-loading'>LOADING GALLERY...</div>";


    const gallery =
        await getData("Gallery");


    if (!gallery.length) {

        container.innerHTML =
            "<div class='gallery-loading'>NO GALLERY ITEMS AVAILABLE</div>";

        return;
    }


    container.innerHTML = "";


    gallery.forEach(
        function (item) {

            const image =
                clean(
                    item.ImageURL ||
                    item.imageURL ||
                    item.URL ||
                    item.MediaURL
                );


            if (!validURL(image)) {
                return;
            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "gallery-item";


            const img =
                document.createElement(
                    "img"
                );


            img.src =
                image;


            img.alt =
                clean(
                    item.Title
                ) ||
                "ROSE & CREWS";


            img.loading =
                "lazy";


            card.appendChild(
                img
            );


            const overlay =
                document.createElement(
                    "div"
                );


            overlay.className =
                "gallery-overlay";


            overlay.innerHTML = `

                <h3>

                    ${escapeHTML(
                        item.Title ||
                        ""
                    )}

                </h3>

                <p>

                    ${escapeHTML(
                        item.Description ||
                        ""
                    )}

                </p>

            `;


            card.appendChild(
                overlay
            );


            container.appendChild(
                card
            );

        }
    );


    if (!container.children.length) {

        container.innerHTML =
            "<div class='gallery-loading'>NO VALID IMAGES FOUND</div>";

    }
}


/* =====================================================
   YOUTUBE URL
   ===================================================== */

function getYouTubeEmbedURL(url) {

    const value =
        clean(url);


    if (!validURL(value)) {
        return "";
    }


    let videoID = "";


    if (
        value.includes(
            "youtube.com/live/"
        )
    ) {

        videoID =
            value
                .split(
                    "youtube.com/live/"
                )[1]
                .split("?")[0]
                .split("/")[0];

    }


    else if (
        value.includes(
            "youtube.com/watch"
        )
    ) {

        try {

            const parsed =
                new URL(value);


            videoID =
                parsed.searchParams.get(
                    "v"
                ) ||
                "";

        } catch (error) {

            console.error(
                "YouTube URL error:",
                error
            );

        }

    }


    else if (
        value.includes(
            "youtu.be/"
        )
    ) {

        videoID =
            value
                .split(
                    "youtu.be/"
                )[1]
                .split("?")[0]
                .split("/")[0];

    }


    if (!videoID) {
        return "";
    }


    return (
        "https://www.youtube.com/embed/" +
        encodeURIComponent(
            videoID
        )
    );
}


/* =====================================================
   VIDEO PAGE
   ===================================================== */

async function loadVideo() {

    const container =
        document.getElementById(
            "videoContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<div class='video-loading'>LOADING VIDEO...</div>";


    const videos =
        await getData("Video");


    if (!videos.length) {

        container.innerHTML =
            "<div class='video-loading'>NO VIDEOS AVAILABLE</div>";

        return;
    }


    container.innerHTML = "";


    videos.forEach(
        function (item) {

            const mediaURL =
                clean(
                    item.MediaURL
                );


            const embedURL =
                getYouTubeEmbedURL(
                    mediaURL
                );


            if (!embedURL) {
                return;
            }


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "video-card";


            card.innerHTML = `

                <div class="video-frame">

                    <iframe

                        src="${escapeHTML(
                            embedURL
                        )}"

                        title="${escapeHTML(
                            item.Title ||
                            "ROSE & CREWS Video"
                        )}"

                        loading="lazy"

                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"

                        allowfullscreen>
                    </iframe>

                </div>

                <div class="video-content">

                    <h2>

                        ${escapeHTML(
                            item.Title ||
                            "Video"
                        )}

                    </h2>

                    <p>

                        ${escapeHTML(
                            item.Author ||
                            ""
                        )}

                        ${
                            item.Date
                                ? " • " +
                                  escapeHTML(
                                      formatDate(
                                          item.Date
                                      )
                                  )
                                : ""
                        }

                    </p>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    if (!container.children.length) {

        container.innerHTML =
            "<div class='video-loading'>NO VALID VIDEOS FOUND</div>";

    }
}


/* =====================================================
   MEMBERS
   ===================================================== */

async function loadMembers() {

    const container =
        document.getElementById(
            "membersContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<div class='members-loading'>LOADING MEMBERS...</div>";


    const members =
        await getData("Members");


    const active =
        members.filter(
            function (item) {

                const status =
                    clean(
                        item.Status
                    ).toLowerCase();


                return (
                    status === "" ||
                    status === "active"
                );

            }
        );


    if (!active.length) {

        container.innerHTML =
            "<div class='members-loading'>NO ACTIVE MEMBERS</div>";

        return;
    }


    container.innerHTML = "";


    active.forEach(
        function (item) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "member-card";


            if (
                validURL(
                    item.AvatarURL
                )
            ) {

                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    clean(
                        item.AvatarURL
                    );


                img.alt =
                    clean(
                        item.DisplayName
                    ) ||
                    clean(
                        item.Username
                    ) ||
                    "Member";


                img.className =
                    "member-avatar";


                img.loading =
                    "lazy";


                card.appendChild(
                    img
                );

            } else {

                const avatar =
                    document.createElement(
                        "div"
                    );


                avatar.className =
                    "member-avatar member-avatar-empty";


                avatar.textContent =
                    (
                        clean(
                            item.DisplayName
                        ) ||
                        clean(
                            item.Username
                        ) ||
                        "M"
                    )
                    .charAt(0)
                    .toUpperCase();


                card.appendChild(
                    avatar
                );

            }


            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "member-content";


            content.innerHTML = `

                <h2>

                    ${escapeHTML(
                        item.DisplayName ||
                        item.Username ||
                        "Member"
                    )}

                </h2>

                <div class="member-role">

                    ${escapeHTML(
                        item.Role ||
                        "MEMBER"
                    )}

                </div>

                <div class="member-country">

                    ${escapeHTML(
                        item.Country ||
                        ""
                    )}

                </div>

                <div class="member-status">
                    🟢 ACTIVE
                </div>

            `;


            card.appendChild(
                content
            );


            container.appendChild(
                card
            );

        }
    );
}


/* =====================================================
   START
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupMobileMenu();

        loadHomeNews();
        loadHomeEvents();
        loadHomeMembers();

        loadNews();
        loadEvents();
        loadGallery();
        loadVideo();
        loadMembers();

    }
);