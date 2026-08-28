const JOIN_API_URL =
    "https://script.google.com/macros/s/AKfycbz7Alv_li574hP_wVpQX7-Ionp9Ib13rUUHOf9xc-XcFmYtusk2oxPb6ftlKthu20nJYg/exec";


const joinForm = document.getElementById("joinForm");
const joinResult = document.getElementById("joinResult");
const joinSubmit = document.getElementById("joinSubmit");


if (joinForm) {

    joinForm.addEventListener("submit", function (event) {

        event.preventDefault();


        joinSubmit.disabled = true;
        joinSubmit.textContent = "SUBMITTING...";


        const formData = new FormData(joinForm);


        const data = {
            action: "submitApplication",

            data: {
                Name: formData.get("Name"),
                DiscordName: formData.get("DiscordName"),
                Email: formData.get("Email"),
                TMP_ID: formData.get("TMP_ID"),
                Age: formData.get("Age"),
                Country: formData.get("Country"),
                Message: formData.get("Message")
            }
        };


        /*
         * Google Apps Script receives this
         * through a normal form POST.
         */

        const submitFrame =
            document.createElement("iframe");

        submitFrame.name =
            "joinSubmitFrame";

        submitFrame.style.display =
            "none";

        document.body.appendChild(
            submitFrame
        );


        const hiddenForm =
            document.createElement("form");

        hiddenForm.method =
            "POST";

        hiddenForm.action =
            JOIN_API_URL;

        hiddenForm.target =
            "joinSubmitFrame";

        hiddenForm.style.display =
            "none";


        const input =
            document.createElement("input");

        input.type =
            "hidden";

        input.name =
            "payload";

        input.value =
            JSON.stringify(data);


        hiddenForm.appendChild(
            input
        );


        document.body.appendChild(
            hiddenForm
        );


        /*
         * Submit to Google Apps Script
         */

        hiddenForm.submit();


        /*
         * Show submitted message
         * after sending the request.
         */

        setTimeout(function () {

            joinForm.style.display =
                "none";

            joinResult.style.display =
                "block";


            joinResult.innerHTML = `

                <div class="join-success">

                    <div class="join-success-icon">
                        ✓
                    </div>


                    <h2>
                        APPLICATION SUBMITTED
                    </h2>


                    <p>
                        Your application has been
                        received successfully.
                    </p>


                    <div class="join-status">

                        <span>
                            STATUS
                        </span>

                        <strong>
                            🟡 PENDING
                        </strong>

                    </div>


                    <p>
                        Our team will review your
                        application.
                    </p>


                    <div class="discord-box">

                        <h3>
                            JOIN OUR DISCORD
                        </h3>


                        <p>
                            Join our Discord server
                            for application updates
                            and announcements.
                        </p>


                        <a
                            href="https://discord.gg/urYPbtnhTY"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn primary">

                            JOIN DISCORD

                        </a>

                    </div>

                </div>

            `;


            hiddenForm.remove();
            submitFrame.remove();


        }, 1500);

    });

}