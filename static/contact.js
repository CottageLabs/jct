jct.d.gebi("contact_form")
    .addEventListener("submit", (event) => {
        event.preventDefault()
    let name  = jct.d.gebi("name").value;
    let email = jct.d.gebi("email").value;
    let message = jct.d.gebi("message").value;

    let data = JSON.stringify(
        {
            "name" : name,
            "email" : email,
            "feedback" : message,
            "context" : {
                "request" : {
                    "timestamp" : event.timeStamp,
                    "issn" : jct.chosen.journal ? jct.chosen.journal.id : "",
                    "funder" : jct.chosen.funder ? jct.chosen.funder.id : "",
                    "ror" : jct.chosen.institution ? jct.chosen.institution.id : ""
                },
                "results" : [
                    jct.latest_response
                ],
                "url" : window.location.href
            }
        });

    console.log(data)
    let xhr = new XMLHttpRequest();
    xhr.open('POST', jct.api + '/feedback');
    xhr.onload = () => {
        console.log(xhr.status);
        jct.d.gebi("feedback_success").style.display = "block"
    };
    xhr.onerror = () => { jct.d.gebi("feedback_error").style.display = "block" };
    xhr.send(data);
    return false
});