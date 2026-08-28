/* =====================================================
   ROSE & CREWS
   ADMIN EVENTS MANAGEMENT
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
    document.getElementById("adminEventsLoading");

const content =
    document.getElementById("adminEventsContent");

const eventsTable =
    document.getElementById("eventsTable");

const eventSearch =
    document.getElementById("eventSearch");

const eventForm =
    document.getElementById("eventForm");

const saveEventBtn =
    document.getElementById("saveEventBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


let allEvents = [];


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
   AUTH
   ===================================================== */

onAuthStateChanged(auth, async user => {

    if (!user) {

        showError("You are not logged in.");

        setTimeout(() => {
            window.location.href = "login.html";
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
});


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
        !== "ACTIVE"
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
        !== "ADMIN"
    ) {

        throw new Error(
            "You do not have ADMIN access."
        );
    }


    await loadEvents();
}


/* =====================================================
   LOAD EVENTS
   ===================================================== */

async function loadEvents() {

    if (loading) {
        loading.textContent =
            "LOADING EVENTS...";
    }


    const response =
        await fetch(
            API_URL +
            "?sheet=Events&v=" +
            Date.now(),
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            "Events database returned HTTP " +
            response.status
        );
    }


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.error ||
            "Unable to load Events."
        );
    }


    allEvents =
        Array.isArray(result.data)
            ? result.data
            : [];


    displayEvents(allEvents);
}


/* =====================================================
   DISPLAY EVENTS
   ===================================================== */

function displayEvents(events) {

    if (!eventsTable) return;


    if (!events.length) {

        eventsTable.innerHTML = `
            <div class="dashboard-card">

                <h3>NO EVENTS FOUND</h3>

                <p>
                    Add your first ROSE & CREWS event.
                </p>

            </div>
        `;

    } else {

        eventsTable.innerHTML =
            events.map(createEventCard).join("");
    }


    if (loading) {
        loading.style.display = "none";
    }

    if (content) {
        content.style.display = "block";
    }
}


/* =====================================================
   EVENT CARD
   ===================================================== */

function createEventCard(item) {

    const id =
        getField(item, "EventID");

    const title =
        getField(item, "Title") ||
        "UNTITLED EVENT";

    const date =
        getField(item, "Date") ||
        "—";

    const time =
        getField(item, "Time") ||
        "—";

    const server =
        getField(item, "Server") ||
        "—";

    const departure =
        getField(item, "Departure") ||
        "—";

    const destination =
        getField(item, "Destination") ||
        "—";

    const description =
        getField(item, "Description") ||
        "—";

    const image =
        clean(
            getField(item, "ImageURL")
        );


    return `
        <article class="dashboard-card admin-event-card">

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
                    onerror="this.style.display='none';">
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
                <strong>TIME:</strong>
                ${escapeHTML(time)}
            </p>

            <p>
                <strong>SERVER:</strong>
                ${escapeHTML(server)}
            </p>

            <p>
                <strong>DEPARTURE:</strong>
                ${escapeHTML(departure)}
            </p>

            <p>
                <strong>DESTINATION:</strong>
                ${escapeHTML(destination)}
            </p>

            <p>
                <strong>EVENT ID:</strong>
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
                    onclick="editEvent('${escapeHTML(id)}')">
                    EDIT
                </button>

                <button
                    type="button"
                    class="btn"
                    style="
                        background:#b90032;
                        border-color:#ff4965;
                    "
                    onclick="deleteEvent('${escapeHTML(id)}')">
                    DELETE
                </button>

            </div>

        </article>
    `;
}


/* =====================================================
   SEARCH
   ===================================================== */

if (eventSearch) {

    eventSearch.addEventListener("input", () => {

        const search =
            clean(eventSearch.value)
                .toLowerCase();


        if (!search) {

            displayEvents(allEvents);

            return;
        }


        const filtered =
            allEvents.filter(item => {

                const text = [

                    getField(item, "EventID"),
                    getField(item, "Title"),
                    getField(item, "Date"),
                    getField(item, "Time"),
                    getField(item, "Server"),
                    getField(item, "Departure"),
                    getField(item, "Destination"),
                    getField(item, "Description")

                ]
                .join(" ")
                .toLowerCase();


                return text.includes(search);
            });


        displayEvents(filtered);
    });
}


/* =====================================================
   ADD EVENT
   ===================================================== */

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                Title:
                    document
                        .getElementById("eventTitle")
                        .value
                        .trim(),

                Date:
                    document
                        .getElementById("eventDate")
                        .value
                        .trim(),

                Time:
                    document
                        .getElementById("eventTime")
                        .value
                        .trim(),

                Server:
                    document
                        .getElementById("eventServer")
                        .value
                        .trim(),

                Departure:
                    document
                        .getElementById("eventDeparture")
                        .value
                        .trim(),

                Destination:
                    document
                        .getElementById("eventDestination")
                        .value
                        .trim(),

                ImageURL:
                    document
                        .getElementById("eventImage")
                        .value
                        .trim(),

                Description:
                    document
                        .getElementById("eventDescription")
                        .value
                        .trim()
            };


            if (!data.Title ||
                !data.Date) {

                alert(
                    "Please enter the event title and date."
                );

                return;
            }


            saveEventBtn.disabled = true;

            saveEventBtn.textContent =
                "ADDING EVENT...";


            try {

                const result =
                    await postAPI({

                        action:
                            "addEvent",

                        data:
                            data
                    });


                if (!result.success) {

                    throw new Error(
                        result.error ||
                        "Unable to add event."
                    );
                }


                alert(
                    "✓ Event added successfully!"
                );


                eventForm.reset();

                await loadEvents();


            } catch (error) {

                console.error(error);

                alert(
                    "Add failed:\n\n" +
                    error.message
                );

            } finally {

                saveEventBtn.disabled = false;

                saveEventBtn.textContent =
                    "ADD EVENT";
            }
        }
    );
}


/* =====================================================
   EDIT EVENT
   ===================================================== */

window.editEvent =
    async function(eventID) {

        const item =
            allEvents.find(event =>
                clean(
                    getField(
                        event,
                        "EventID"
                    )
                )
                ===
                clean(eventID)
            );


        if (!item) {

            alert(
                "Event not found."
            );

            return;
        }


        const title =
            prompt(
                "Event Title:",
                getField(item, "Title")
            );

        if (title === null) return;


        const date =
            prompt(
                "Date:",
                getField(item, "Date")
            );

        if (date === null) return;


        const time =
            prompt(
                "Time:",
                getField(item, "Time")
            );

        if (time === null) return;


        const server =
            prompt(
                "Server:",
                getField(item, "Server")
            );

        if (server === null) return;


        const departure =
            prompt(
                "Departure:",
                getField(item, "Departure")
            );

        if (departure === null) return;


        const destination =
            prompt(
                "Destination:",
                getField(item, "Destination")
            );

        if (destination === null) return;


        const description =
            prompt(
                "Description:",
                getField(item, "Description")
            );

        if (description === null) return;


        const image =
            prompt(
                "Image URL:",
                getField(item, "ImageURL")
            );

        if (image === null) return;


        await updateEvent(
            eventID,
            {
                Title:
                    title.trim(),

                Date:
                    date.trim(),

                Time:
                    time.trim(),

                Server:
                    server.trim(),

                Departure:
                    departure.trim(),

                Destination:
                    destination.trim(),

                Description:
                    description.trim(),

                ImageURL:
                    image.trim()
            }
        );
    };


/* =====================================================
   UPDATE EVENT
   ===================================================== */

async function updateEvent(
    eventID,
    updates
) {

    try {

        const result =
            await postAPI({

                action:
                    "updateEvent",

                EventID:
                    eventID,

                updates:
                    updates
            });


        if (!result.success) {

            throw new Error(
                result.error ||
                "Event update failed."
            );
        }


        alert(
            "✓ Event updated successfully!"
        );


        await loadEvents();


    } catch (error) {

        console.error(error);

        alert(
            "Update failed:\n\n" +
            error.message
        );
    }
}


/* =====================================================
   DELETE EVENT
   ===================================================== */

window.deleteEvent =
    async function(eventID) {

        const item =
            allEvents.find(event =>
                clean(
                    getField(
                        event,
                        "EventID"
                    )
                )
                ===
                clean(eventID)
            );


        const title =
            item
            ?
            getField(item, "Title")
            :
            eventID;


        if (
            !confirm(
                `Delete this event?\n\n"${title}"\n\nThis cannot be undone.`
            )
        ) {

            return;
        }


        try {

            const result =
                await postAPI({

                    action:
                        "deleteEvent",

                    EventID:
                        eventID
                });


            if (!result.success) {

                throw new Error(
                    result.error ||
                    "Event deletion failed."
                );
            }


            alert(
                "✓ Event deleted successfully!"
            );


            await loadEvents();


        } catch (error) {

            console.error(error);

            alert(
                "Delete failed:\n\n" +
                error.message
            );
        }
    };


/* =====================================================
   POST API
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

            </div>
        `;
    }

    if (content) {
        content.style.display = "none";
    }
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