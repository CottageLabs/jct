jct.explain = (q) => {
    let compliant_routes = `<h2>Compliant Routes</h2>`
    let noncompliant_routes = `<h2>Non-Compliant Routes</h2>`
    let compliant_routes_number = 0;
    let noncomplicant_routes_number = 0;

    q.results.forEach((r) => {
        if (r.compliant !== 'unknown') {
            let route = `
            <h3>` + jct.COMPLIANCE_ROUTES_LONG[r.route] + `</h3>
            <p>You <b>`  + (r.compliant === "yes" ? "are Plan S compliant" : "cannot comply with Plan S") + `</b> on this route (` + jct.COMPLIANCE_ROUTES_LONG[r.route] + `).</p>
            <p>The following checks were carried out to determine that this is`  + (r.compliant === "yes" ? "" : "not") + ` a compliant route:</p>
        `
            r.log.forEach((log) => {
                route += "<ul><li>" + log.action + "</li>"
                route += "<ul><li>" + log.result + "</li>"
                if (log.url) {
                    route += "<li>" + log.url + "</li>"
                }
                route += "</ul></ul>"
            })

            if (r.compliant === "yes") {
                compliant_routes_number++;
                compliant_routes += route;
            } else {
                noncomplicant_routes_number++;
                noncompliant_routes += route;
            }
        }
    });

    let text =
        `
        <h2>Your query</h2>
        
        <p>You asked us to calculate whether you are Plan S compliant under the following conditions:
        
        <ul>
            <li>Journal: </li>
            <ul class="second">
                <li> ISSN: ` + q.request.journal[0].id + `</li>
                <li> Title: ` + q.request.journal[0].title + `</li>
                <li> Publisher: ` + (q.request.journal[0].publisher !== undefined ? q.request.journal[0].publisher : "Not known") + `</li>
            </ul> 
            <li>Funder: ` + q.request.funder[0].title + `</li>`

    if ((q.request.institution.length > 0)){
        text +=
            `
            <li>Institution: </li>
                <ul>
                    <li> ROR: ` + q.request.institution[0].id + `</li>
                    <li> Title: ` + q.request.institution[0].title + `</li>
                </ul>`
    }
    else {
        text += `<li>Not part of Higher Education</li>`
    }

    text +=
        `</ul>
        
        We carried out this query at ` + new Date(q.request.started).toUTCString() +`, and found ` +
        compliant_routes_number + ` compliant routes and ` + noncomplicant_routes_number + ` non-compliant routes.
        </p>
    `

    let detailed_results = jct.d.gebi("detailed_results")

    let elem = htmlToElement("<div id='detailed_result_text'>" + text + (compliant_routes_number > 0 ? compliant_routes : "") + (noncomplicant_routes_number > 0 ? noncompliant_routes : "") + "</div>");
    detailed_results.append(elem);

    jct.d.gebi("print").addEventListener("click", () => {
        let a = window.open('', '', 'height=500, width=500');
        let compliance = jct.d.gebc("compliance")[0]
        let results_to_print = jct.d.gebi("detailed_result_text")
        a.document.write(compliance.innerHTML);
        a.document.write(results_to_print.innerHTML);
        a.document.close();
        a.print();
    })
}