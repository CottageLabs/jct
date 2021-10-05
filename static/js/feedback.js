jct.setup_feedback_modal = () => {
    // WARNING: Feedback modal uses generic id names. If embedding in the plugin, need to change id names
    if (jct.d.gebi('feedback')) {
        jct.d.gebi('feedback').addEventListener("click", (e) => {
            e.preventDefault();
            let modal = jct.d.gebi('jct_modal_feedback')
            jct.d.gebi('message').value = "";
            jct.d.gebi('feedback_success').style.display = "none";
            jct.d.gebi('feedback_error').style.display = "none";
            modal.style.display = 'block';
        });

        jct.d.gebi("contact_form")
            .addEventListener("submit", (event) => {
                event.preventDefault()
            let name  = jct.d.gebi("name").value;
            let email = jct.d.gebi("email").value;
            let message = jct.d.gebi("message").value;
            let timestamp = new Date().toUTCString()

            let data =
                JSON.stringify({
                    "name" : name,
                    "email" : email,
                    "feedback" : message,
                    "context" : {
                        "request" : {
                            "timestamp" : timestamp,
                            "issn" : jct.chosen.journal ? jct.chosen.journal.id : "",
                            "funder" : jct.chosen.funder ? jct.chosen.funder.id : "",
                            "ror" : jct.chosen.institution ? jct.chosen.institution.id : "",
                            "navigator data": {
                                "appCodeName": navigator.appCodeName,
                                "appName": navigator.appName,
                                "appVersion": navigator.appVersion,
                                "cookieEnabled": navigator.cookieEnabled,
                                "language": navigator.language,
                                "platform": navigator.platform,
                                "userAgent": navigator.userAgent,
                                "vendor": navigator.vendor
                            }
                        },
                        "results" : [
                            jct.latest_response
                        ],
                        "url" : window.location.href
                    }
                });

            let xhr = new XMLHttpRequest();
            xhr.open('POST', jct.api + '/feedback');
            xhr.onload = () => {
                alert("message sent successfully")
                //jct.d.gebi("feedback_success").style.display = "block"
            };
            xhr.onerror = () => {
                //jct.d.gebi("feedback_error").style.display = "block"
                alert("Oops, something went wrong");
            };
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(data);
            jct.d.gebi('modal_feedback').style.display = "none";
            return false
        });
    }
}

