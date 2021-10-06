jct.explain = (q) => {
    let detailed_results = jct.d.gebi("jct_detailed_results_section")
    detailed_results.innerHTML = "";
    let compliant_routes = `<h2>${jct.lang.explain.supporting_data.compliant_routes}</h2>`
    let non_compliant_routes = `<h2>${jct.lang.explain.supporting_data.non_compliant_routes}</h2>`
    let unknown_routes = `<h2>${jct.lang.explain.supporting_data.unknown_routes}</h2>`
    let compliant_routes_number = 0;
    let non_compliant_routes_number = 0;
    let unknown_routes_number = 0;

    q.results.forEach((r) => {
        let name = jct.lang.explain.routes[r.route].label; // jct.api_codes[r.route]['name'];
        let statement = jct.lang.explain.routes[r.route][r.compliant].statement// jct.api_codes[r.route]['statement'][r.compliant];
        let explanation = jct.lang.explain.routes[r.route][r.compliant].explanation// jct.api_codes[r.route]['explanation'][r.compliant];
        let qualification = jct.get_qualifications(r.qualifications);
        let route = `<h3>` + name + `</h3>` +
                    `<p>`  + statement + `</p>` +
                    `<p>`  + qualification + `</p>` +
                    `<p>`  + explanation + `</p>`;

        let is_in_doaj = jct.is_in_doaj(r.route, r.log);
        let is_in_progress_doaj = jct.is_in_progress_doaj(r.route, r.log);
        if (r.log) {
            let route_defined = r.route in jct.lang.api_codes.logs;
            r.log.forEach((log) => {
                let action = log.code;
                if (is_in_doaj && action === 'FullOA.NotInProgressDOAJ') {
                    return;
                }
                if (is_in_progress_doaj && action === 'FullOA.NotInDOAJ') {
                    return;
                }
                if (route_defined && log.code in jct.lang.api_codes.logs[r.route]) {
                    action = jct.lang.api_codes.logs[r.route][log.code];
                }
                let parameters = ''
                if (log.parameters) {
                    for (let [parameter,values] of Object.entries(log.parameters)) {
                        let parent_key = log.code + '.Properties';
                        if (route_defined && parent_key in jct.lang.api_codes.logs[r.route] &&
                            parameter in jct.lang.api_codes.logs[r.route][parent_key] &&
                            jct.lang.api_codes.logs[r.route][parent_key][parameter]) {
                            // The key is displayed irrespective of the value existing
                            parameters += jct.lang.api_codes.logs[r.route][parent_key][parameter] + "<br/>";
                        }

                        if (values && values.length > 0) {
                            parameters += "<ul>";
                            values.forEach((value) => {
                                if (parameter === 'version') {
                                    value = jct.version_rename(value);
                                }
                                parameters += "<li>" + value + "</li>";
                            })
                            parameters += "</ul>";
                        }
                    }
                }
                route += "<ul><li>" + action + "</li>";
                route += parameters;
                route += "</ul>";
            })
        }

        if (r.compliant === "yes") {
            compliant_routes_number++;
            compliant_routes += route;
        } else if (r.compliant === "no") {
            non_compliant_routes_number++;
            non_compliant_routes += route;
        } else {
            unknown_routes_number++;
            unknown_routes += route;
        }
    });

    let blurb_for_count = "";
    [compliant_routes_number,
     non_compliant_routes_number,
     unknown_routes_number].forEach((num, index) => {
        let human_num = (num === 0) ? 'no' : num;
        switch(index) {
            case 0:
                if (num === 1) {
                    blurb_for_count += '1 route that enables compliance, ';
                } else {
                    blurb_for_count += human_num + ' routes that enable compliance, ';
                }
                break;
            case 1:
                if (num === 1) {
                    blurb_for_count += '1 non-compliant route and ';
                } else {
                    blurb_for_count += human_num + ' non-compliant routes and ';
                }
                break;
            case 2:
                if (num === 1) {
                    blurb_for_count += '1 undetermined route.';
                } else {
                    blurb_for_count += human_num + ' undetermined routes.';
                }
                break;
        }
    })
    let issns = jct.chosen.journal.issn.join(", ");
    let publisher = jct.chosen.journal.publisher !== undefined ? jct.chosen.journal.publisher : "Not known";

    let journal = "Unknown Title"
    if (jct.chosen.journal.title) {
        journal = jct.chosen.journal.title;
    }
    journal += " (ISSN: " + issns + ")";

    let text =
        `
        <h3>${jct.lang.explain.your_query.title}</h3>

        <p>${jct.lang.explain.your_query.text}

        <ul>
            <li>${jct.lang.explain.your_query.journal_label}: </li>
            <ul class="second">
                <li> ` + journal + `</li>
                <li> ${jct.lang.explain.your_query.publisher_label}: ` + publisher + `</li>
            </ul>
            <li>${jct.lang.explain.your_query.funder_label}: ` + jct.chosen.funder.title + `</li>`

    if (jct.chosen.institution){
        inner_text = `${jct.lang.explain.your_query.institution_label}: ` + jct.chosen.institution.title;
        if (jct.chosen.institution.alternate && !(/^[a-zA-Z0-9 ]+$/.test(jct.chosen.institution.alternate))) {
            inner_text += ' (' + jct.chosen.institution.alternate + ')';
        }
        if (jct.chosen.institution.country) {
            inner_text += ', ' + jct.chosen.institution.country;
        }
        if (jct.chosen.institution.id) {
            inner_text += ' (ROR: ' + jct.chosen.institution.id + ')';
        }
        text +=
            `
            <li>` + inner_text + `</li>`
    }
    else {
        text += `<li>${jct.lang.explain.your_query.unaffiliated}</li>`
    }

    // FIXME: hold off on this bit until we do a full reimplementation of the explain section
    text +=
        `</ul>

        We carried out this query at ` + new Date(q.request.started).toUTCString() +
        `, and found ` + blurb_for_count + `
        </p>
    `

    let elem = jct.htmlToElement("<div id='jct_detailed_result_text'>" + text +
        (compliant_routes_number > 0 ? compliant_routes : "") +
        (non_compliant_routes_number > 0 ? non_compliant_routes : "") +
        (unknown_routes_number > 0 ? unknown_routes : "") + "</div>");
    detailed_results.append(elem);

    let print = jct.d.gebi('jct_print');
    if (print) {
        print.addEventListener("click", () => {
            let a = window.open('', '', 'height=500, width=500');
            let compliance = jct.d.gebc("jct_compliance")[0];
            let results_to_print = jct.d.gebi("jct_detailed_result_text");
            let share_url = jct.d.gebi("jct_results_url");
            let share_text = ''
            if (share_url) {
                share_text = `To view these results, visit <a href="`+ share_url.innerHTML +`">`+ share_url.innerHTML + `</a>`
            }
            a.document.write(compliance.innerHTML);
            a.document.write(results_to_print.innerHTML);
            a.document.write(share_text);
            a.document.close();
            a.print();
        })
    }

    let share = jct.d.gebi('jct_share_results');
    if (share) {
        jct.d.gebi('jct_share_results').addEventListener("click", (e) => {
            e.preventDefault();
            let modal = jct.d.gebi('jct_modal_share');
            modal.style.display = 'block';
        });
        jct.display_results_url();
    }
}

jct.get_qualifications = (qualifications) => {
    let qualification = '';
    if ((typeof qualifications !== "undefined") && qualifications.length > 0) {
        for (let [key,values] of Object.entries(qualifications[0])) {
            if (key in jct.lang.api_codes.qualifications && 'description' in jct.lang.api_codes.qualifications[key]) {
                qualification = jct.lang.api_codes.qualifications[key]['description'] + "<br/>";
                if (values) {
                    for (let [k2,v2] of Object.entries(values)) {
                        if (v2) {
                            let label = k2;
                            if (key in jct.lang.api_codes.qualifications && k2 in jct.lang.api_codes.qualifications[key]) {
                                label = jct.lang.api_codes.qualifications[key][k2]
                            }
                            qualification += label + ' ' + v2 + "<br/>";
                        }
                    }
                }
            }
        }
    }
    if (qualification) {
        return `<p>` + jct.lang.explain.supporting_data.qualifications_prefix + ` ` + qualification + `</p>`;
    }
    return qualification
}

jct.is_in_doaj = (route, logs) => {
    if (route !== 'fully_oa') { return false }
    let is_in = false;
    logs.forEach((log) => {
        if (log.code === 'FullOA.InDOAJ') {
            is_in = true;
        }
    })
    return is_in
}

jct.is_in_progress_doaj = (route, logs) => {
    if (route !== 'fully_oa') { return false }
    let is_in = false;
    logs.forEach((log) => {
        if (log.code === 'FullOA.InProgressDOAJ') {
            is_in = true;
        }
    })
    return is_in
}

jct.version_rename = (val) => {
    let new_val;
    switch(val) {
        case "publishedVersion":
            new_val = jct.lang.explain.versions.publishedVersion;
            break;
        case "acceptedVersion":
            new_val = jct.lang.explain.versions.acceptedVersion;
            break;
        case "submittedVersion":
            new_val = jct.lang.explain.versions.submittedVersion;
            break;
        default:
            new_val = val;
   }
   return new_val
}
