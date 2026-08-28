/* =====================================================
   ROSE & CREWS
   ADMIN MEMBERS MANAGEMENT — FIXED
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
   Supports both the old and corrected IDs.
   ===================================================== */

const loading =
    document.getElementById("adminMembersLoading") ||
    document.getElementById("adminLoading");

const content =
    document.getElementById("adminMembersContent") ||
    document.getElementById("adminContent");

const membersList =
    document.getElementById("membersList") ||
    document.getElementById("membersTable");

const searchInput =
    document.getElementById("memberSearch");

const memberCount =
    document.getElementById("memberCount");

const editPanel =
    document.getElementById("editMemberPanel");

const editForm =
    document.getElementById("editMemberForm");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const saveMessage =
    document.getElementById("saveMessage");

const logoutBtn =
    document.getElementById("logoutBtn");


let allMembers = [];
let selectedMemberID = "";


/* =====================================================
   HELPERS
   ===================================================== */

function clean(value) {
    return String(value ?? "").trim();
}

function getField(object, wantedField) {
    if (!object || typeof object !== "object") return "";

    const wanted = clean(wantedField).toLowerCase();

    const key = Object.keys(object).find(key =>
        clean(key).toLowerCase() === wanted
    );

    return key === undefined ? "" : (object[key] ?? "");
}

function normalizeMember(member) {
    return {
        MemberID: getField(member, "MemberID"),
        Username: getField(member, "Username"),
        DisplayName: getField(member, "DisplayName"),
        Role: getField(member, "Role"),
        AvatarURL: getField(member, "AvatarURL"),
        Country: getField(member, "Country"),
        JoinDate: getField(member, "JoinDate"),
        TMP_ID: getField(member, "TMP_ID"),
        TruckersHub_ID: getField(member, "TruckersHub_ID"),
        STATUS: getField(member, "STATUS"),
        FirebaseUID: getField(member, "FirebaseUID"),
        Access: getField(member, "Access")
    };
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function setLoading(message) {
    if (!loading) return;
    loading.style.display = "block";
    loading.textContent = message;
}

function showError(message) {
    if (content) content.style.display = "none";

    if (!loading) {
        alert(message);
        return;
    }

    loading.style.display = "block";
    loading.innerHTML = `
        <div class="dashboard-error">
            <div style="font-size:40px;">⚠️</div>
            <h2>ADMIN ACCESS ERROR</h2>
            <p>${escapeHTML(message)}</p>
            <a href="dashboard.html" class="btn primary">
                RETURN TO DASHBOARD
            </a>
        </div>
    `;
}

function showMessage(message, type = "success") {
    if (!saveMessage) {
        alert(message);
        return;
    }

    saveMessage.style.display = "block";
    saveMessage.className = "dashboard-message " + type;
    saveMessage.textContent = message;
}


/* =====================================================
   AUTH + ADMIN VERIFICATION
   ===================================================== */

onAuthStateChanged(auth, async (user) => {
    console.log("ROSE & CREWS ADMIN MEMBERS AUTH CHECK", user);

    if (!user) {
        showError("You are not logged in.");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

        return;
    }

    try {
        await verifyAdmin(user.uid);
    } catch (error) {
        console.error("ADMIN VERIFICATION ERROR:", error);
        showError(error.message || "Unable to verify admin access.");
    }
});


async function verifyAdmin(firebaseUID) {
    setLoading("VERIFYING ADMIN ACCESS...");

    const url =
        API_URL +
        "?sheet=Members&v=" +
        Date.now();

    console.log("Fetching Members:", url);

    const response = await fetch(url, {
        method: "GET",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            "Members database returned HTTP " + response.status
        );
    }

    const result = await response.json();

    console.log("Members API result:", result);

    if (!result.success) {
        throw new Error(
            result.error || "Unable to load Members sheet."
        );
    }

    if (!Array.isArray(result.data)) {
        throw new Error("Members database returned invalid data.");
    }

    const members = result.data.map(normalizeMember);

    const currentUID = clean(firebaseUID).toLowerCase();

    const currentMember = members.find(member =>
        clean(member.FirebaseUID).toLowerCase() === currentUID
    );

    if (!currentMember) {
        throw new Error(
            "Your Firebase UID was not found in the Members sheet."
        );
    }

    if (clean(currentMember.STATUS).toUpperCase() !== "ACTIVE") {
        throw new Error(
            "Your ROSE & CREWS member account is not ACTIVE."
        );
    }

    if (clean(currentMember.Access).toUpperCase() !== "ADMIN") {
        throw new Error("You do not have ADMIN access.");
    }

    console.log("ADMIN VERIFIED:", currentMember);

    allMembers = members;
    displayMembers(allMembers);
}


/* =====================================================
   MEMBER LIST
   ===================================================== */

function displayMembers(members) {
    if (!membersList) {
        throw new Error(
            "Member list element not found. Check admin-members.html."
        );
    }

    if (memberCount) {
        memberCount.textContent =
            `${members.length} MEMBER${members.length === 1 ? "" : "S"}`;
    }

    if (!members.length) {
        membersList.innerHTML = `
            <div class="dashboard-card">
                <strong>NO MEMBERS FOUND</strong>
            </div>
        `;
    } else {
        membersList.innerHTML = members
            .map(createMemberCard)
            .join("");
    }

    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";
}

function createMemberCard(member) {
    const avatar = clean(member.AvatarURL);

    const name = escapeHTML(
        member.DisplayName || member.Username || "MEMBER"
    );

    const username = escapeHTML(member.Username || "—");
    const role = escapeHTML(member.Role || "—");
    const country = escapeHTML(member.Country || "—");
    const status = escapeHTML(member.STATUS || "—");
    const access = escapeHTML(member.Access || "—");
    const memberID = escapeHTML(member.MemberID || "—");
    const safeID = escapeAttribute(member.MemberID);

    return `
        <div class="dashboard-card admin-member-card">

            <div class="profile-avatar">
                <img
                    src="${avatar || "assets/logo.png"}"
                    alt="${name}"
                    onerror="this.onerror=null;this.src='assets/logo.png';">
            </div>

            <div class="profile-info">

                <span class="profile-role">${role}</span>

                <h2>${name}</h2>

                <p>@${username}</p>

                <p>${country}</p>

                <p>
                    MEMBER ID:
                    <strong>${memberID}</strong>
                </p>

                <div class="member-status">
                    🟢 ${status}
                    &nbsp; | &nbsp;
                    🔐 ${access}
                </div>

            </div>

            <div class="member-admin-actions">
                <button
                    type="button"
                    class="btn primary"
                    onclick="editMember('${safeID}')">
                    EDIT
                </button>
            </div>

        </div>
    `;
}


/* =====================================================
   SEARCH
   ===================================================== */

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const search =
            clean(searchInput.value).toLowerCase();

        if (!search) {
            displayMembers(allMembers);
            return;
        }

        const filtered = allMembers.filter(member => {
            const text = [
                member.MemberID,
                member.Username,
                member.DisplayName,
                member.Role,
                member.Country,
                member.TMP_ID,
                member.TruckersHub_ID,
                member.STATUS,
                member.FirebaseUID,
                member.Access
            ].join(" ").toLowerCase();

            return text.includes(search);
        });

        displayMembers(filtered);
    });
}


/* =====================================================
   EDIT MEMBER
   Uses the existing edit form in admin-members.html.
   ===================================================== */

window.editMember = function(memberID) {
    const member = allMembers.find(item =>
        clean(item.MemberID) === clean(memberID)
    );

    if (!member) {
        alert("Member not found.");
        return;
    }

    selectedMemberID = clean(member.MemberID);

    const values = {
        editMemberID: member.MemberID,
        editUsername: member.Username,
        editDisplayName: member.DisplayName,
        editRole: member.Role,
        editAccess: member.Access,
        editCountry: member.Country,
        editJoinDate: member.JoinDate,
        editTMP: member.TMP_ID,
        editHub: member.TruckersHub_ID,
        editStatus: member.STATUS,
        editAvatarURL: member.AvatarURL,
        editFirebaseUID: member.FirebaseUID
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value ?? "";
    });

    if (saveMessage) {
        saveMessage.style.display = "none";
        saveMessage.textContent = "";
    }

    if (editPanel) {
        editPanel.style.display = "block";
        editPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
};


/* =====================================================
   CANCEL EDIT
   ===================================================== */

if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
        selectedMemberID = "";

        if (editPanel) {
            editPanel.style.display = "none";
        }

        if (saveMessage) {
            saveMessage.style.display = "none";
        }
    });
}


/* =====================================================
   SAVE MEMBER
   ===================================================== */

if (editForm) {
    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!selectedMemberID) {
            alert("Please select a member first.");
            return;
        }

        const submitButton =
            editForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "SAVING...";
        }

        if (saveMessage) {
            saveMessage.style.display = "none";
        }

        try {
            const updates = {
                Username: document.getElementById("editUsername")?.value.trim() || "",
                DisplayName: document.getElementById("editDisplayName")?.value.trim() || "",
                Role: document.getElementById("editRole")?.value.trim() || "",
                Access: document.getElementById("editAccess")?.value.trim().toUpperCase() || "MEMBER",
                Country: document.getElementById("editCountry")?.value.trim() || "",
                JoinDate: document.getElementById("editJoinDate")?.value.trim() || "",
                TMP_ID: document.getElementById("editTMP")?.value.trim() || "",
                TruckersHub_ID: document.getElementById("editHub")?.value.trim() || "",
                STATUS: document.getElementById("editStatus")?.value.trim().toUpperCase() || "ACTIVE",
                AvatarURL: document.getElementById("editAvatarURL")?.value.trim() || ""
            };

            console.log("Saving member:", selectedMemberID, updates);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify({
                    action: "updateMember",
                    MemberID: selectedMemberID,
                    updates: updates
                })
            });

            if (!response.ok) {
                throw new Error(
                    "Server returned HTTP " + response.status
                );
            }

            const result = await response.json();

            console.log("Save result:", result);

            if (!result.success) {
                throw new Error(
                    result.error || "Member update failed."
                );
            }

            showMessage(
                "✓ Member updated successfully in Google Sheets.",
                "success"
            );

            // Reload the list from Google Sheets.
            await verifyAdmin(auth.currentUser.uid);

            const updated = allMembers.find(item =>
                clean(item.MemberID) === selectedMemberID
            );

            if (updated) {
                window.editMember(selectedMemberID);
            }

        } catch (error) {
            console.error("SAVE ERROR:", error);

            showMessage(
                "Update failed: " + error.message,
                "error"
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "SAVE CHANGES";
            }
        }
    });
}


/* =====================================================
   LOGOUT
   ===================================================== */

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            logoutBtn.disabled = true;
            logoutBtn.textContent = "LOGGING OUT...";

            await signOut(auth);

            window.location.href = "login.html";

        } catch (error) {
            console.error("Logout error:", error);

            logoutBtn.disabled = false;
            logoutBtn.textContent = "LOGOUT";
        }
    });
}


/* =====================================================
   END
   ===================================================== */
