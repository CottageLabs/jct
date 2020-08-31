jct.explain = (q) => {
    console.log(q)

    let compliant_routes = `<h2>Compliant Routes</h2>`
    let noncompliant_routes = `<h2>Non-Compliant Routes</h2>`
    let compliant_routes_number = 0;
    let noncomplicant_routes_number = 0;

    q.results.forEach((r) => {
        if (r.compliant !== 'unknown') {
            let route = `
            <h3>` + jct.COMPLIANCE_ROUTES_LONG[r.route] + `</h3>
            <p>You <b>`  + (r.compliant === "yes" ? "are Plan S compliant" : "cannot comply with Plan S") + `</b> on this route (` + jct.COMPLIANCE_ROUTES_LONG[r.route] + `).</p>
            <p>The following checks were carried out to determine that this is a compliant route:</p>
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
        <h1>Explain my result</h1>
        <h2>Your query</h2>
        
        <p> You asked us to calculate whether you are Plan S compliant under the following conditions:
        
        <ul>
            <li>Journal ISSN: ` + q.request.issn[0] + `</li> 
            <li>Funder: ` + q.request.funder[0] + `</li> 
            <li>Institution Ror: ` + q.request.ror[0] + `</li> 
        </ul>
        
        We carried out this query at ` + new Date(q.request.started).toUTCString() +`, and found ` +
        compliant_routes_number + ` complaint routes and ` + noncomplicant_routes_number + ` non-compliant routes.
        
        </p>
    `

    let elem = htmlToElement("<div>" + text + compliant_routes + noncompliant_routes + "</div>")
    jct.d.gebi("detailed_results").append(elem);

        

        // If you wish to take this route to Plan S compliance, there are a number of things to take into consideration:
        //
        // [For each \`qualifications\` entry]
        // * [qualification description, including parameters if present]
        //
        //
        //
        //
        // ### [Route Type]
        //
        // You cannot comply with Plan S on this route ([Route Type]) under the following conditions:
        //
        // * Journal ISSN: [ISSN]
        // * Funder: [list of funders]
        // * Institutions: [list of institutions]
        //
        // The following checks were carried out to determine that this is a non-compliant route:
        //
        // [For each \`log\` entry]
        // * [action]
        //     * [result]
        //     * For reference, see: [url]
        // [end For]

}