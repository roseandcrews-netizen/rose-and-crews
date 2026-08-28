/* =====================================================
   ROSE & CREWS — MEMBER DASHBOARD
   Members: view everyone, edit only themselves.
   Admins: continue to the admin dashboard.
   ===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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

const API_URL = "https://script.google.com/macros/s/AKfycbz7Alv_li574hP_wVpQX7-Ionp9Ib13rUUHOf9xc-XcFmYtusk2oxPb6ftlKthu20nJYg/exec";

const loading = document.getElementById("dashboardLoading");
const content = document.getElementById("dashboardContent");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("memberSearch");
const membersList = document.getElementById("membersList");
const memberCount = document.getElementById("memberCount");
const ownPanel = document.getElementById("ownProfilePanel");
const ownForm = document.getElementById("ownProfileForm");
const editOwnBtn = document.getElementById("editOwnProfileBtn");
const cancelOwnBtn = document.getElementById("cancelOwnEditBtn");
const ownSaveMessage = document.getElementById("ownSaveMessage");

let allMembers = [];
let currentMember = null;
let currentFirebaseUID = "";

function getField(obj, field, fallback = "") {
    if (!obj || typeof obj !== "object") return fallback;
    const wanted = String(field).trim().toLowerCase();
    const key = Object.keys(obj).find(k => String(k).trim().toLowerCase() === wanted);
    if (key === undefined || obj[key] == null) return fallback;
    return obj[key];
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

function clean(value) {
    return String(value ?? "").trim();
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showError(message) {
    if (!loading) return;
    loading.innerHTML = `
        <div class="dashboard-error">
            <div style="font-size:40px;">⚠️</div>
            <h2>DASHBOARD ERROR</h2>
            <p>${escapeHTML(message)}</p>
        </div>`;
    loading.style.display = "block";
}

async function fetchMembers() {
    const response = await fetch(API_URL + "?sheet=Members&v=" + Date.now(), {
        method: "GET",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("Member database returned HTTP " + response.status);
    }

    const result = await response.json();

    if (!result || result.success !== true) {
        throw new Error(result?.error || "Unable to load Members sheet.");
    }

    if (!Array.isArray(result.data)) {
        throw new Error("Members database returned invalid data.");
    }

    return result.data.map(normalizeMember);
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        showError("You are not logged in. Redirecting to login...");
        setTimeout(() => window.location.href = "login.html", 1200);
        return;
    }

    currentFirebaseUID = clean(user.uid).toLowerCase();

    try {
        if (loading) loading.textContent = "CONNECTING TO MEMBER DATABASE...";

        allMembers = await fetchMembers();

        currentMember = allMembers.find(member =>
            clean(member.FirebaseUID).toLowerCase() === currentFirebaseUID
        );

        if (!currentMember) {
            throw new Error("Your Firebase UID was not found in the Members sheet.");
        }

        const status = clean(currentMember.STATUS).toUpperCase();
        if (status !== "ACTIVE") {
            throw new Error("Your ROSE & CREWS member account is not ACTIVE.");
        }

        const access = clean(currentMember.Access).toUpperCase();

        if (access === "ADMIN") {
            window.location.href = "admin-dashboard.html";
            return;
        }

        if (access !== "MEMBER") {
            throw new Error("Invalid Access value in Members sheet: " + (access || "(empty)"));
        }

        displayOwnProfile(currentMember);
        renderMembers(allMembers);
        showDashboard();

    } catch (error) {
        console.error("DASHBOARD ERROR:", error);
        showError(error.message || "Unable to load your member profile.");
    }
});

function showDashboard() {
    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = clean(value) || "—";
}

function displayOwnProfile(member) {
    setText("memberID", member.MemberID);
    setText("memberUsername", member.Username);
    setText("memberName", member.DisplayName);
    setText("memberRole", member.Role);
    setText("memberCountry", member.Country);
    setText("memberCountryCard", member.Country);
    setText("memberTMP", member.TMP_ID);
    setText("memberHub", member.TruckersHub_ID);
    setText("memberJoinDate", member.JoinDate);

    const statusElement = document.getElementById("memberStatus");
    if (statusElement) {
        const status = clean(member.STATUS).toUpperCase();
        statusElement.textContent = status === "ACTIVE" ? "🟢 ACTIVE" : "🔴 " + (status || "UNKNOWN");
    }

    const avatar = document.getElementById("memberAvatar");
    if (avatar) {
        avatar.src = clean(member.AvatarURL) || "assets/logo.png";
        avatar.onerror = function () {
            this.onerror = null;
            this.src = "assets/logo.png";
        };
    }

    const hubLink = document.getElementById("truckersHubLink");
    const hubID = clean(member.TruckersHub_ID);

    if (hubLink) {
        if (hubID && hubID.toUpperCase() !== "N/A") {
            hubLink.href = "https://truckershub.net/user/" + encodeURIComponent(hubID);
            hubLink.style.display = "";
        } else {
            hubLink.removeAttribute("href");
            hubLink.style.display = "none";
        }
    }
}

function renderMembers(members) {
    if (!membersList) return;

    if (memberCount) {
        memberCount.textContent = `${members.length} MEMBER${members.length === 1 ? "" : "S"}`;
    }

    if (!members.length) {
        membersList.innerHTML = `<div class="dashboard-card"><strong>NO MEMBERS FOUND</strong></div>`;
        return;
    }

    membersList.innerHTML = members.map(member => {
        const name = escapeHTML(member.DisplayName || member.Username || "MEMBER");
        const username = escapeHTML(member.Username || "—");
        const role = escapeHTML(member.Role || "—");
        const country = escapeHTML(member.Country || "—");
        const memberID = escapeHTML(member.MemberID || "—");
        const status = clean(member.STATUS).toUpperCase();
        const avatar = escapeHTML(member.AvatarURL || "assets/logo.png");

        return `
            <article class="community-member-card">
                <div class="community-member-avatar">
                    <img src="${avatar}" alt="${name}" onerror="this.onerror=null;this.src='assets/logo.png';">
                </div>
                <div class="community-member-info">
                    <span class="profile-role">${role}</span>
                    <h3>${name}</h3>
                    <p>@${username}</p>
                    <div class="community-member-meta">
                        <span>🌍 ${country}</span>
                        <span>🆔 ${memberID}</span>
                        <span>${status === "ACTIVE" ? "🟢 ACTIVE" : "🔴 " + (status || "UNKNOWN")}</span>
                    </div>
                </div>
            </article>`;
    }).join("");
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const query = clean(searchInput.value).toLowerCase();

        if (!query) {
            renderMembers(allMembers);
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
                member.TruckersHub_ID
            ].join(" ").toLowerCase();

            return text.includes(query);
        });

        renderMembers(filtered);
    });
}

function openOwnEditor() {
    if (!currentMember || !ownPanel) return;

    document.getElementById("ownMemberID").value = clean(currentMember.MemberID);
    document.getElementById("ownUsername").value = clean(currentMember.Username);
    document.getElementById("ownDisplayName").value = clean(currentMember.DisplayName);
    document.getElementById("ownCountry").value = clean(currentMember.Country);
    document.getElementById("ownTMP").value = clean(currentMember.TMP_ID);
    document.getElementById("ownHub").value = clean(currentMember.TruckersHub_ID);
    document.getElementById("ownAvatarURL").value = clean(currentMember.AvatarURL);
    document.getElementById("ownRole").value = clean(currentMember.Role);
    document.getElementById("ownStatus").value = clean(currentMember.STATUS);

    if (ownSaveMessage) ownSaveMessage.style.display = "none";

    ownPanel.style.display = "block";
    ownPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeOwnEditor() {
    if (ownPanel) ownPanel.style.display = "none";
}

if (editOwnBtn) editOwnBtn.addEventListener("click", openOwnEditor);
if (cancelOwnBtn) cancelOwnBtn.addEventListener("click", closeOwnEditor);

if (ownForm) {
    ownForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentMember || !currentFirebaseUID) {
            alert("Your member profile is not ready.");
            return;
        }

        const button = ownForm.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.textContent = "SAVING...";
        }

        try {
            /*
             * IMPORTANT:
             * The MemberID and FirebaseUID are taken from the authenticated
             * member already loaded from the sheet. Role, Access, Status and
             * JoinDate are deliberately NOT sent as editable fields.
             */
            const updates = {
                Username: document.getElementById("ownUsername").value.trim(),
                DisplayName: document.getElementById("ownDisplayName").value.trim(),
                Country: document.getElementById("ownCountry").value.trim(),
                TMP_ID: document.getElementById("ownTMP").value.trim(),
                TruckersHub_ID: document.getElementById("ownHub").value.trim(),
                AvatarURL: document.getElementById("ownAvatarURL").value.trim()
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    action: "updateMember",
                    MemberID: currentMember.MemberID,
                    FirebaseUID: currentFirebaseUID,
                    updates
                })
            });

            if (!response.ok) {
                throw new Error("Server returned HTTP " + response.status);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Profile update failed.");
            }

            if (ownSaveMessage) {
                ownSaveMessage.style.display = "block";
                ownSaveMessage.className = "dashboard-message success";
                ownSaveMessage.textContent = "✓ Your profile was updated successfully.";
            }

            allMembers = await fetchMembers();

            currentMember = allMembers.find(member =>
                clean(member.FirebaseUID).toLowerCase() === currentFirebaseUID
            );

            if (!currentMember) throw new Error("Your updated profile could not be found.");

            displayOwnProfile(currentMember);
            renderMembers(allMembers);

        } catch (error) {
            console.error("PROFILE SAVE ERROR:", error);

            if (ownSaveMessage) {
                ownSaveMessage.style.display = "block";
                ownSaveMessage.className = "dashboard-message error";
                ownSaveMessage.textContent = "Update failed: " + error.message;
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "SAVE MY PROFILE";
            }
        }
    });
}

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
