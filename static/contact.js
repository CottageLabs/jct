let send_feedback = (event) => {
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
                    "timestamp" : event.timestamp,
                    "issn" : jct.chosen.journal ? jct.chosen.journal.issn : "",
                    "funder" : jct.chosen.funder ? jct.chosen.funder.id : "",
                    "ror" : jct.chosen.institution ? jct.chosen.institution.id : ""
                },
                "results" : [
                    jct.latest_response
                ],
                "url" : window.location
            }
        });

    let xhr = new XMLHttpRequest();
    xhr.open('POST', jct.api + '/feedback');
    xhr.onload = () => {console.log(xhr.status)}
    xhr.onprogress = () => {console.log("progress...")}
    xhr.onerror = () => {console.log("error")}
    // xhr.onload = () => { xhr.status !== 200 ? jct.error(xhr) : (typeof after === 'function' ? after(xhr) : jct.success(xhr)); };
    // xhr.onprogress = (e) => { jct.progress(e); };
    // xhr.onerror = () => { jct.error(); };
    // xhr.send(data);
    return false
}