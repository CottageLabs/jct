// ----------------------------------------
// Initial definitions
// ----------------------------------------
let jct = {
    api: JCT_API_endpoint,
    host: JCT_UI_BASE_URL,
    delay: 500,
    cache: {},
    chosen: {},
    latest_response: null,
    lang: JCT_LANG
};

jct.d = document;

jct.d.gebi = document.getElementById;

jct.d.gebc = document.getElementsByClassName;

jct.COMPLIANCE_ROUTES_SHORT = {
    fully_oa: "fully_oa",
    ta: "ta",
    tj: "tj",
    sa: "self_archiving"
}

// ----------------------------------------
// html for input form
// ----------------------------------------
jct.inputs_plugin_html =`
    <h2 class="sr-only">Make a query</h2>
    <div class="col col--1of3 expression">
        <div class="expression__input" id="jct_journal-container">
        </div>
        <div class="expression__operator">
            <svg width="36" height="36" viewbox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3 3L18.3 33M3 17.7H33" stroke="white" stroke-width="5" stroke-linecap="round"></path>
            </svg>
        </div>
    </div>

    <div class="col col--1of3 expression">
        <div class="expression__input"  id="jct_funder-container">
        </div>
        <div class="expression__operator">
            <svg width="36" height="36" viewbox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3 3L18.3 33M3 17.7H33" stroke="white" stroke-width="5" stroke-linecap="round"></path>
            </svg>
        </div>
    </div>

    <div class="col col--1of3 expression">
        <div class="expression__input">
            <div id="jct_institution-container">
            </div>
            <br>
            <div class="expression__checkbox">
                <input type="checkbox" id="jct_notHE" name="notHE">
                <label for="notHE">No affiliation</label>
            </div>
        </div>
        <div class="expression__operator">
            <div>
                <svg width="70" height="70" viewbox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M22.5 22C21.1193 22 20 23.1193 20 24.5C20 25.8807 21.1193 27 22.5 27H47.5C48.8807 27 50 25.8807 50 24.5C50 23.1193 48.8807 22 47.5 22H22.5ZM22.5 42C21.1193 42 20 43.1193 20 44.5C20 45.8807 21.1193 47 22.5 47H47.5C48.8807 47 50 45.8807 50 44.5C50 43.1193 48.8807 42 47.5 42H22.5Z" fill="white"></path>
                </svg>
            </div>
        </div>
    </div>

    <div class="col col--1of3 suggest" id="jct_suggestjournal">
    </div>
    <div class="col col--1of3 suggest" id="jct_suggestfunder">
    </div>
    <div class="col col--1of3 suggest" id="jct_suggestinstitution">
    </div>
    <div class="loading" id="jct_loading" style="display:none">
        <div class="loading__dots">
            <div></div>
            <div></div>
            <div></div>
            <span class="sr-only">Loading choices…</span>
        </div>
    </div>
`;

// ----------------------------------------
// html for results_plugin
// ----------------------------------------
jct.results_plugin_html = `
    <header class="jct_compliance">
        <h2 id="jct_compliant" style="display:none">${jct.lang.site.compliant}</h2>
        <h2 id="jct_notcompliant" style="display:none">${jct.lang.site.non_compliant}</h2>
    </header>
`;

// ----------------------------------------
// html for tiles_plugin
// ----------------------------------------
jct.tiles_plugin_html = `
    <section class="row" id="jct_paths_results">
        <h3 class="sr-only">Results</h3>
    </section>
`;

// ----------------------------------------
// Cards
// ----------------------------------------

jct.getCardsToDisplay = function(config, results) {

    function _matches(cardConfig, results) {
        return _matches_routes(cardConfig.match_routes, results) &&
            _matches_qualifications(cardConfig.match_qualifications, results);
    }

    function _matches_routes(routes, results) {
        if (!routes) {
            return true;
        }

        let compliantRoutes = [];
        for (let i = 0; i < results.length; i++) {
            let r = results[i];
            if (r.compliant === "yes") {
                compliantRoutes.push(r.route);
            }
        }

        if (routes.must) {
            for (let i = 0; i < routes.must.length; i++) {
                let mr = routes.must[i];
                if (!compliantRoutes.includes(mr)) {
                    return false;
                }
            }
        }

        if (routes.not) {
            for (let i = 0; i < routes.not.length; i++) {
                let nr = routes.not[i];
                if (compliantRoutes.includes(nr)) {
                    return false;
                }
            }
        }

        if (routes.or) {
            for (let i = 0; i < routes.or.length; i++) {
                let or = routes.or[i];
                if (compliantRoutes.includes(or)) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    function _matches_qualifications(qualifications, results) {
        if (!qualifications) {
            return true;
        }

        if (qualifications.must) {
            for (let i = 0; i < qualifications.must.length; i++) {
                let mq = qualifications.must[i];
                if (!_hasQualification(mq, results)) {
                    return false;
                }
            }
        }

        if (qualifications.not) {
            for (let i = 0; i < qualifications.not.length; i++) {
                let nq = qualifications.not[i];
                if (_hasQualification(nq, results)) {
                    return false;
                }
            }
        }

        if (qualifications.or) {
            for (let i = 0; i < qualifications.or.length; i++) {
                let oq = qualifications.or[i];
                if (_hasQualification(oq, results)) {
                    return true;
                }
            }
            return false;
        }

        return true;
    }

    function _hasQualification(path, results) {
        let bits = path.split(".");
        for (let i = 0; i < results.length; i++) {
            let r = results[i];
            if (bits[0] === r.route) {
                if ("qualifications" in r) {
                    for (let j = 0; j < r.qualifications.length; j++) {
                        let qual = r.qualifications[j];
                        if (Object.keys(qual).includes(bits[1])) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // list the cards to display
    let cards = [];
    for (let i = 0; i < config.cards.length; i++) {
        let cardConfig = config.cards[i];
        if (_matches(cardConfig, results)) {
            cards.push(cardConfig);
        }
    }

    // sort them according to the correct order
    let sorted_cards = []
    for (let i = 0; i < config.card_order.length; i++) {
        let next = config.card_order[i];
        for (let j = 0; j < cards.length; j++) {
            let card = cards[j];
            if (card.id === next) {
                sorted_cards.push(card);
            }
        }
    }

    return sorted_cards;
}

// jct.ORDER_OF_TILES = ['fully_oa', 'ta', 'tj', 'sa', 'sa_rr']

jct.preferred_label = `<a href="#" class="jct_open_preferred_modal"><em>${jct.lang.site.preferred}</em></a><br/><br/>`

// FIXME: I don't think we need these, just keeping them around until I'm sure
// jct.card_icons = {
//     tj_modal: `<span alt="circle help icon" class="helpicon_img tile_help" id="jct_open_tj_modal">
//         <svg width="25" height="25" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path fill-rule="evenodd" clip-rule="evenodd" d="M120 62.5C120 94.2564 94.2564 120 62.5 120C30.7436 120 5
//                 94.2564 5 62.5C5 30.7436 30.7436 5 62.5 5C94.2564 5 120 30.7436 120 62.5ZM125 62.5C125 97.0178 97.0178
//                 125 62.5 125C27.9822 125 0 97.0178 0 62.5C0 27.9822 27.9822 0 62.5 0C97.0178 0 125 27.9822 125 62.5ZM56.293
//                 78.1533V79.9238H60.2168V79.2539C60.2168 76.1595 60.4561 73.8307 60.9346 72.2676C61.445 70.7044 62.2425
//                 69.221 63.3271 67.8174C64.4437 66.3818 66.0228 64.8027 68.0645 63.0801C69.8509 61.5807 71.4779 60.193
//                 72.9453 58.917C74.4128 57.6091 75.6569 56.2692 76.6777 54.8975C77.7305 53.4938 78.5439 51.9785 79.1182
//                 50.3516C79.6924 48.7246 79.9795 46.8265 79.9795 44.6572C79.9795 39.1702 78.3047 34.8636 74.9551 31.7373C71.6055
//                 28.5791 67.0117 27 61.1738 27C58.6536 27 56.1973 27.2552 53.8047 27.7656C51.444 28.276 48.5091 29.2969
//                 45 30.8281L46.7705 34.6562C49.3226 33.4121 51.6992 32.5189 53.9004 31.9766C56.1016 31.4023 58.4622
//                 31.1152 60.9824 31.1152C65.321 31.1152 68.8141 32.3115 71.4619 34.7041C74.1416 37.0967 75.4814
//                 40.3187 75.4814 44.3701C75.4814 46.8584 74.987 49.0596 73.998 50.9736C73.0091 52.8877 71.3662
//                 54.8177 69.0693 56.7637L64.7148 60.5439C61.4928 63.3831 59.2757 66.0469 58.0635 68.5352C56.8831
//                 71.0234 56.293 74.2295 56.293 78.1533ZM58.542 89.542C55.9899 89.542 54.7139 91.1051 54.7139 94.2314C54.7139
//                 97.3577 55.9899 98.9209 58.542 98.9209C61.1579 98.9209 62.4658 97.3577 62.4658 94.2314C62.4658 91.1051
//                 61.1579 89.542 58.542 89.542Z" fill="black"/>
//         </svg>
//     </span>`,
//     sa_modal: `<span alt="circle help icon" class="helpicon_img tile_help" id="jct_open_sa_modal" >
//         <svg width="25" height="25" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg">
//             <path fill-rule="evenodd" clip-rule="evenodd" d="M120 62.5C120 94.2564 94.2564 120 62.5 120C30.7436 120 5
//                 94.2564 5 62.5C5 30.7436 30.7436 5 62.5 5C94.2564 5 120 30.7436 120 62.5ZM125 62.5C125 97.0178 97.0178
//                 125 62.5 125C27.9822 125 0 97.0178 0 62.5C0 27.9822 27.9822 0 62.5 0C97.0178 0 125 27.9822 125 62.5ZM56.293
//                 78.1533V79.9238H60.2168V79.2539C60.2168 76.1595 60.4561 73.8307 60.9346 72.2676C61.445 70.7044 62.2425
//                 69.221 63.3271 67.8174C64.4437 66.3818 66.0228 64.8027 68.0645 63.0801C69.8509 61.5807 71.4779 60.193
//                 72.9453 58.917C74.4128 57.6091 75.6569 56.2692 76.6777 54.8975C77.7305 53.4938 78.5439 51.9785 79.1182
//                 50.3516C79.6924 48.7246 79.9795 46.8265 79.9795 44.6572C79.9795 39.1702 78.3047 34.8636 74.9551 31.7373C71.6055
//                 28.5791 67.0117 27 61.1738 27C58.6536 27 56.1973 27.2552 53.8047 27.7656C51.444 28.276 48.5091 29.2969
//                 45 30.8281L46.7705 34.6562C49.3226 33.4121 51.6992 32.5189 53.9004 31.9766C56.1016 31.4023 58.4622
//                 31.1152 60.9824 31.1152C65.321 31.1152 68.8141 32.3115 71.4619 34.7041C74.1416 37.0967 75.4814
//                 40.3187 75.4814 44.3701C75.4814 46.8584 74.987 49.0596 73.998 50.9736C73.0091 52.8877 71.3662
//                 54.8177 69.0693 56.7637L64.7148 60.5439C61.4928 63.3831 59.2757 66.0469 58.0635 68.5352C56.8831
//                 71.0234 56.293 74.2295 56.293 78.1533ZM58.542 89.542C55.9899 89.542 54.7139 91.1051 54.7139 94.2314C54.7139
//                 97.3577 55.9899 98.9209 58.542 98.9209C61.1579 98.9209 62.4658 97.3577 62.4658 94.2314C62.4658 91.1051
//                 61.1579 89.542 58.542 89.542Z" fill="black"/>
//         </svg>
//     </span>`
// }

// FIXME: this currently won't work until we bring in card.js
jct.build_tile = (tile_name, customised_text = '') => {
    return `<div class="col col--1of4">
        <article class="card">
            <h4 class="label card__heading">
                ${tile_name}
            </h4>
            ${customised_text}
        </article>
    </div>`;
    // if (!tile_name in jct.ui_text.tiles) {
    //     return '';
    // }
    // let config_data = jct.ui_text.tiles[tile_name];
    // let icon = config_data.icon && config_data.icon in jct.card_icons ? jct.card_icons[config_data.icon] : '';
    // let preferred = config_data.preferred ? jct.preferred_label : '';
    // let modal_icon = config_data.modal_icon && config_data.modal_icon in jct.card_icons ? jct.card_icons[config_data.modal_icon] : '';
    // return `<div class="col col--1of4">
    //     <article class="card">
    //         ${icon}
    //         <h4 class="label card__heading">
    //             ${preferred}
    //             <span>${config_data.title}</span>
    //             ${modal_icon}
    //         </h4>
    //         ${config_data.text} ${customised_text}
    //     </article>
    // </div>`;
}

// ----------------------------------------
// html for non compliant tiles
// ----------------------------------------
jct.non_compliant_options_html =
    jct.build_tile('journal_non_compliant') +
    jct.build_tile('funder_non_compliant') +
    jct.build_tile('institution_non_compliant') +
    jct.build_tile('rights_retention_non_compliant');

// ----------------------------------------
// html for fully_oa tile in results
// ----------------------------------------
jct.fullyOA_tile = (_chosen_data, _qualifications) => {
    let fullyOA_tile_html = jct.build_tile('fully_oa');
    return jct.htmlToElement (fullyOA_tile_html);
}

// ----------------------------------------
// html for transformative_agreement_tile in results
// needs journal, institution title and author qualification
// ----------------------------------------
jct.transformative_agreement_tile = (chosen_data, qualifications) => {
    // text
    // let author_qualification = jct.author_qualification(qualifications)
    // let title = chosen_data.journal.title ? chosen_data.journal.title : chosen_data.journal.id;
    // let publisher = chosen_data.journal.publisher ? chosen_data.journal.publisher : 'the publisher';
    // let institution = chosen_data.institution.title ? chosen_data.institution.title : 'the institution';
    // let condition_text;
    // if (author_qualification) {
    //     condition_text = `<p>${author_qualification}<br/><br/>
    //         Other conditions may also be in place around publishing through this agreement.
    //         <a href="#" id="jct_open_ta_modal">Make sure to read this information</a>.</p>`
    // } else {
    //     condition_text = `<p>Conditions may be in place around publishing through this agreement.
    //         <a href="#" id="jct_open_ta_modal">Make sure to read this information</a>.</p>`
    // }
    // let text = `${condition_text}
    //     <p><em>${title}</em> is part of a transformative agreement between <em>${publisher}</em> and <em>${institution}</em></p>`
    //
    // let ta_tile_html = jct.build_tile('ta', text);
    //
    // return jct.htmlToElement(ta_tile_html);
    return jct.htmlToElement("TA");
}

// ----------------------------------------
// html for transformative_journal_tile in results
// ----------------------------------------
jct.transformative_journal_tile = (_chosen_data, _qualifications) => {
    let tj_tile_html = jct.build_tile('tj');
    return jct.htmlToElement(tj_tile_html);
}

// ----------------------------------------
// html for self_archiving_tile in results
// ----------------------------------------
jct.self_archiving_tile = (_chosen_data, _qualifications) => {
    let sa_tile_html = jct.build_tile('sa');
    return jct.htmlToElement(sa_tile_html);
}

// ----------------------------------------
// html for self_archiving_using_rights_retention_tile in results
// ----------------------------------------
jct.sa_rights_retention_tile = (_chosen_data, _qualifications) => {
    text = '<p><a href="#" id="jct_open_sa_rr_modal">More information</a></p>';
    let sa_rr_tile_html = jct.build_tile('sa_rr', text);
    return jct.htmlToElement(sa_rr_tile_html);
}

// ----------------------------------------
// html for fullyOA_self_archiving_tile in results
// ----------------------------------------
jct.fullyOA_self_archiving_tile = (_chosen_data, _qualifications) => {
    let fully_oa_sa_tile_html = jct.build_tile('fully_oa_sa');
    return jct.htmlToElement(fully_oa_sa_tile_html);
}

// FIXME: this won't work until we introduce general modals
jct.build_modal = (modal_type) => {
    // if (!modal_type in jct.ui_text.modals) {
    //     return '';
    // }
    // let config_data = jct.ui_text.modals[modal_type];
    // let modal_html = `<div class="modal" id="jct_modal_${modal_type}" style="display: none">
    //     <div class="modal-content" id="jct_modal_${modal_type}_content">
    //         <header class="modal-header">
    //             <h2>${config_data.title}
    //                 <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_${modal_type}">&times;</span>
    //             </h2>
    //         </header>
    //         <div>${config_data.text}</div>
    //     </div>
    // </div>`
    // return modal_html;
}

// ----------------------------------------
// html for transformative agreement modal
// ----------------------------------------
jct.ta_modal_html = jct.build_modal('ta');

// ----------------------------------------
// html for transformative journal modal
// ----------------------------------------
jct.tj_modal_html = jct.build_modal('tj');

// ----------------------------------------
// html for self archiving modal
// ----------------------------------------
jct.sa_modal_html = jct.build_modal('sa');

// ----------------------------------------
// html for self archiving using rights retention modal
// ----------------------------------------
jct.sa_rr_modal_html = jct.build_modal('sa_rr');

// ----------------------------------------
// html for preferred results modal
// ----------------------------------------
jct.preferred_modal_html = jct.build_modal('preferred');

// ----------------------------------------
// html for help modal (what is PlanS)
// ----------------------------------------
jct.help_modal_html = jct.build_modal('help');

// ----------------------------------------
// html for feedback modal
// ----------------------------------------
jct.feedback_modal_html = jct.build_modal('feedback');

jct.share_modal_html = `
    <div class="modal" id="jct_modal_share" style="display: none">
        <div class="modal-content" id="jct_modal_share_content">
            <header class="modal-header">
                <h2>Share this result
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_share">&times;</span>
                </h2>
            </header>
            <div>
                <p>To share this result, copy the following link
                    <button class="button button--primary" style="float: right;" onClick="jct.copy_results_url()">Copy</button>
                </p>
                <p id="jct_results_url"></p>
            </div>
        </div>
    </div>
`;

// ----------------------------------------
// Function add modal containers
// ----------------------------------------
jct.add_modal_containers = (modal_div, only_feedback=false) => {
    let modal_container_html = jct.feedback_modal_html;
    if (only_feedback === false) {
        modal_container_html += jct.ta_modal_html +
            jct.tj_modal_html +
            jct.sa_modal_html +
            jct.sa_rr_modal_html +
            jct.preferred_modal_html +
            jct.help_modal_html +
            jct.share_modal_html;
    }
    modal_div.innerHTML = modal_container_html;
}

// ----------------------------------------
// Function to setup modal on the page
// ----------------------------------------
// FIXME: need to be replaced with general approach to modal opening
jct.setup_modals = (only_feedback=false) => {
    // let modal_div = jct.d.gebi("jct_modal_container");
    // if (modal_div.children.length === 0) {
    //     // Add the modal html and event handlers
    //     jct.add_modal_containers(modal_div, only_feedback);
    //
    //     if (jct.d.gebi('feedback')) {
    //         jct.setup_feedback_modal();
    //     }
    //
    //     if (jct.d.gebi('jct_open_help_modal')) {
    //         jct.d.gebi('jct_open_help_modal').addEventListener("click", (e) => {
    //             e.preventDefault();
    //             let modal = jct.d.gebi('jct_modal_help');
    //             modal.style.display = 'block';
    //         })
    //     }
    //
    //     window.onclick = (e) => {
    //         let modals = [].slice.call(jct.d.gebc("modal"));
    //         if (modals.includes(e.target)){
    //             e.target.style.display = "none";
    //         }
    //     }
    //
    //     jct.d.each("jct_modal_close", (el) => {
    //         el.addEventListener("click", (e) => {
    //             let id = e.target.getAttribute("data-id");
    //             let modal = document.getElementById(id);
    //             modal.style.display = "none";
    //         })
    //     })
    // }
}

// ----------------------------------------
// Function _emptyElement
// ----------------------------------------
jct._emptyElement = (elem) => {
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// ----------------------------------------
// helper function to iterate over all
// ----------------------------------------
jct.d.each = (cls, key, val) => {
    if (cls.indexOf('.') === 0) cls = cls.replace('.','');
    let els = jct.d.gebc(cls);
    for ( let i = 0; i < els.length; i++ ) {
        if (typeof key === 'function') {
            key(els[i]);
        } else {
            els[i][key] = val;
        }
    }
};

// ----------------------------------------
// function to calculate if all data provided by the input boxes
// ----------------------------------------
jct._calculate_if_all_data_provided = () => {
    if (jct.chosen.journal && jct.chosen.funder && (jct.chosen.institution || jct.d.gebi("jct_notHE").checked)) {
        jct.suggesting = false;
        let qr = {issn: jct.chosen.journal.id};
        qr.funder = jct.chosen.funder.id;
        if (jct.chosen.institution) {
            qr.ror = jct.chosen.institution.id;
        }
        jct.jx('/calculate', qr);
        jct.d.gebi("jct_loading").style.display = "block";
    }
}

// ----------------------------------------
// function to set focus on next element after choosing from auto suggestion and
// calculate if all data provided
// ----------------------------------------
jct.choose = (e, el, which) => {
    let id = el["id"];
    let title = el["title"];
    jct.chosen[which] = el;
    if (which === 'journal') {
        jct.d.gebi('jct_funder').focus();
    } else if (which === 'funder') {
        jct.d.gebi('jct_institution').focus();
    } else {
        jct.d.gebi('jct_institution').blur();
        jct.d.gebi('jct_notHE').checked = false;
    }
    jct._calculate_if_all_data_provided();
}

// ----------------------------------------
// function to handle errors from main api response
// ----------------------------------------
jct.error = (xhr) => {
    jct.latest_response = xhr;
}

// ----------------------------------------
// function to handle progress from main api response
// ----------------------------------------
jct.progress = (e) => {
    // not used
}

// ----------------------------------------
// function to handle success from main api response
// ----------------------------------------
jct.success = (xhr) => {
    jct.d.gebi('jct_compliant').style.display = 'none';
    jct.d.gebi('jct_notcompliant').style.display = 'none';
    jct.d.gebi("jct_loading").style.display = "none";
    let js = JSON.parse(xhr.response);
    if (!jct.result_equals_chosen(js.request))
        return;
    jct.latest_response = js.results;
    let paths_results = jct.d.gebi("jct_paths_results");
    jct._emptyElement(paths_results)
    jct.display_result(js);
    if (jct.d.gebi("jct_explain_results")) {
        jct.d.gebi('jct_explain_results').style.display = 'initial';
        jct.d.hide_detailed_results();
        jct.explain(js)
    }
    if (jct.d.gebi("jct_find_out_more")) {
        jct.setup_fom_url();
    }
}

//-----------------------------------------
// function to display the results
//-----------------------------------------
jct.display_result = (js) => {
    jct.d.gebi(js.compliant ? 'jct_compliant' : 'jct_notcompliant').style.display = 'block';
    jct.d.gebi("jct_results").style.display = 'block';
    if (js.compliant) {
        jct._setComplianceTheme(true);
    }
    else {
        jct._setComplianceTheme(false);
        // jct._addNonCompliantOptions();
    }
    let cardsToDisplay = jct.getCardsToDisplay(jct.config, js.results);
    jct.displayCards(cardsToDisplay, js.results);

    x = window.matchMedia("(max-width: 767px)")
    let results_section_top = jct.d.gebi("jct_results_plugin").offsetTop
    let inputs_height = 0
    if (!x.matches) {
        inputs_height = jct.d.gebi("jct_journal").offsetHeight
    }
    if (typeof window.JCT_WIDGET == 'undefined'){
        window.scrollTo(0, results_section_top - inputs_height)
    }
}

// ----------------------------------------
// function to add non compliant html response
// ----------------------------------------
jct._addNonCompliantOptions = () => {
    jct.d.gebi("jct_paths_results").innerHTML = jct.non_compliant_options_html;
}

// ----------------------------------------
// function to set the theme (add appropriate div classes) based on compliance of results
// ----------------------------------------
jct._setComplianceTheme = (compliant) => {
    let query_div = jct.d.gebi('jct_query');
    let results_div = jct.d.gebi('jct_results');
    if (compliant === undefined) {
        if (query_div.classList.contains("query--non-compliant")) {
            query_div.classList.remove("query--non-compliant");
        }
        if (results_div.classList.contains("results--non-compliant")) {
            results_div.classList.remove("results--non-compliant");
        }
        if (query_div.classList.contains("query--compliant")) {
            query_div.classList.remove("query--compliant");
        }
        if (results_div.classList.contains("results--compliant")) {
            results_div.classList.remove("results--compliant");
        }
    }
    else if (compliant){
        if (query_div.classList.contains("query--non-compliant")) {
            query_div.classList.remove("query--non-compliant");
        }
        if (results_div.classList.contains("results--non-compliant")) {
            results_div.classList.remove("results--non-compliant");
        }
        query_div.classList.add('query--compliant');
        results_div.classList.add('results--compliant');
    }
    else {
        if (query_div.classList.contains("query--compliant")) {
            query_div.classList.remove("query--compliant");
        }
        if (results_div.classList.contains("results--compliant")) {
            results_div.classList.remove("results--compliant");
        }
        query_div.classList.add('query--non-compliant');
        results_div.classList.add('results--non-compliant');
    }
}

// ----------------------------------------
// function to check for self archiving rights retention route in result
// ----------------------------------------
jct.sa_rights_retention_check = (result) => {
    // check if qualification with id rights_retention_author_advice exists
    // in the result
    let has_rights_retention = false;
    if ("qualifications" in result) {
        result.qualifications.forEach((q) => {
            if ("rights_retention_author_advice" in q) {
                has_rights_retention = true;
            }
        })
    }
    return has_rights_retention;
}

// ----------------------------------------
// function to check if fully oa route is compliant
// ----------------------------------------
jct.fully_oa_check = (results) => {
    let has_fully_oa = false;
    results.forEach((r) => {
        if (r.compliant === "yes" && r.route === jct.COMPLIANCE_ROUTES_SHORT.fully_oa) {
            has_fully_oa = true;
        }
    })
    return has_fully_oa;
}

// ----------------------------------------
// function to get the author qualification description
// ----------------------------------------
jct.author_qualification = (qualifications) => {
    let author_qualification = '';
    if ((typeof qualifications !== "undefined") && qualifications.length > 0) {
        for (let [key,values] of Object.entries(qualifications[0])) {
            if (key === 'corresponding_authors' && key in jct.lang.api_codes.qualifications &&
                'description' in jct.lang.api_codes.qualifications[key]) {
                author_qualification = jct.lang.api_codes.qualifications[key]['description'];
            }
        }
    }
    return author_qualification;
}

// ----------------------------------------
// function to get tiles to display
// ----------------------------------------
// jct.get_tiles_to_display = (results) => {
//     let tiles_to_display = {}
//     let has_fully_oa = jct.fully_oa_check(results);
//     results.forEach((r) => {
//         if (r.compliant === "yes") {
//             switch (r.route) {
//                 case jct.COMPLIANCE_ROUTES_SHORT.fully_oa:
//                     tiles_to_display['fully_oa'] = r
//                     break;
//                 case jct.COMPLIANCE_ROUTES_SHORT.ta:
//                     tiles_to_display['ta'] = r
//                     break;
//                 case jct.COMPLIANCE_ROUTES_SHORT.tj:
//                     tiles_to_display['tj'] = r
//                     break;
//                 case jct.COMPLIANCE_ROUTES_SHORT.sa:
//                     if (!has_fully_oa) {
//                         let has_sa_rights_retention = jct.sa_rights_retention_check(r);
//                         if (has_sa_rights_retention) {
//                             tiles_to_display['sa_rr'] = r
//                         } else {
//                             tiles_to_display['sa'] = r
//                         }
//                     }
//                     break;
//             }
//         }
//     })
//     if ('fully_oa' in tiles_to_display && 'sa' in tiles_to_display) {
//         delete tiles_to_display.sa;
//     }
//     return tiles_to_display;
// }

// ----------------------------------------
// Function to display the selected list of tiles
// ----------------------------------------
jct.displayCards = (cardsToDisplay, result) => {
    // let chosen_data = jct.chosen;
    for (let i = 0; i < cardsToDisplay.length; i++) {
        let cardConfig = cardsToDisplay[i];
        let card = jct.buildCard(cardConfig, jct.lang, result, jct.chosen);
        jct.d.gebi("jct_paths_results").append(jct.htmlToElement(card));
    }
    // jct.ORDER_OF_TILES.forEach((tile_name) => {
    //     if (tile_name in tiles_to_display) {
    //         let result = tiles_to_display[tile_name];
    //         let tile = jct.display_tile(tile_name, chosen_data, result);
    //         jct.d.gebi("jct_paths_results").append(tile);
    //         jct.activate_tile_modal(tile_name);
    //     }
    // })
    // jct.activate_preferred_modal();
}

// ----------------------------------------
// Function to display specific tile
// ----------------------------------------

jct.buildCard = function(cardConfig, uiText, results, choices) {
    // img: cards.[card_id].icon
    // site.preferred
    // cards.[card_id].title
    //
    // cards.[card_id].body.default
    // cards.[card_id].body.[compliant route id]

    let cardText = uiText.cards[cardConfig.id];

    // get the icon if it exists, and the icon identifier is not "false" (the string).
    let icon = "";
    if (cardText.icon && cardText.icon !== "false") {
        icon = uiText.icons[cardText.icon];
        if (icon === undefined) {
            icon = "";
        }
    }

    let preferred = cardConfig.preferred === "true" ? `<em>${uiText.site.preferred}</em><br><br>` : "";
    let modal = cardConfig.hasOwnProperty("modal") ? `<a href="#" class="modal-trigger" data-modal="${cardConfig.modal}">${uiText.site.card_modal}</a>` : "";

    let body = "";
    if (cardText.body.hasOwnProperty("default")) {
        body += cardText.body.default;
    }

    let compliantRoutes = [];
    for (let i = 0; i < results.length; i++) {
        let r = results[i];
        if (r.compliant === "yes") {
            compliantRoutes.push(r.route);
        }
    }

    if (cardConfig.hasOwnProperty("display_if_compliant")) {
        for (let i = 0; i < cardConfig.display_if_compliant.length; i++) {
            let route = cardConfig.display_if_compliant[i];
            if (compliantRoutes.includes(route)) {
                if (cardText.body.hasOwnProperty(route)) {
                    body += cardText.body[route];
                }
            }
        }
    }

    body = body.replace("{title}", choices.journal.title);
    body = body.replace("{funder}", choices.funder.title);
    body = body.replace("{publisher}", choices.journal.publisher);
    body = body.replace("{institution}", choices.institution.title);

    return `<div class="col col--1of4">
        <article class="card">
            ${icon}
            <h4 class="label card__heading">
                ${preferred}
                <span>${cardText.title}</span>
            </h4>
            ${body}
            <p>${modal}</p>
        </article>
    </div>`;
}

// jct.display_tile = (tile_name, chosen_data, result) => {
//     let tile;
//     switch (tile_name) {
//         case 'fully_oa':
//             tile = jct.fullyOA_tile(chosen_data, result.qualifications);
//             break;
//         case 'ta':
//             tile = jct.transformative_agreement_tile(chosen_data, result.qualifications);
//             break;
//         case 'tj':
//             tile = jct.transformative_journal_tile(chosen_data, result.qualifications);
//             break;
//         case 'self_archiving':
//             tile = jct.self_archiving_tile(chosen_data, result.qualifications);
//             break;
//         case 'sa_rr':
//             tile  = jct.sa_rights_retention_tile(chosen_data, result.qualifications);
//             break;
//     }
//     return tile;
// }

// ----------------------------------------
// function to add event handler for a modal associated with a tile
// ----------------------------------------
jct.activate_tile_modal = (tile_name) => {
    let modal_id = 'jct_open_' + tile_name + '_modal';
    if (jct.d.gebi(modal_id)) {
        jct.d.gebi(modal_id).addEventListener("click", (e) => {
            e.preventDefault();
            let modal_name = 'jct_modal_' + tile_name;
            let modal = jct.d.gebi(modal_name);
            modal.style.display = 'block';
        })
    }
}

// ----------------------------------------
// function to add event handler for modal associated with preferred tiles
// ----------------------------------------
jct.activate_preferred_modal = () => {
    let preferred_tiles = jct.d.gebc("jct_open_preferred_modal");
    for (let i = 0; i < preferred_tiles.length; i++) {
        let preferred_tile = preferred_tiles[i];
        preferred_tile.addEventListener("click", (e) => {
            e.preventDefault();
            let modal = jct.d.gebi("jct_modal_preferred");
            modal.style.display = "block";
        });
    }
}

// ----------------------------------------
// Function to scroll to the result tiles
// ----------------------------------------
jct.scroll_to_result_tiles = () => {
    x = window.matchMedia("(max-width: 767px)")
    let results_section_top = jct.d.gebi("jct_results_plugin").offsetTop
    let inputs_height = 0
    if (!x.matches) {
        inputs_height = jct.d.gebi("jct_journal").offsetHeight
    }
    window.scrollTo(0, results_section_top - inputs_height)
    //results_section.scrollIntoView({scrollIntoViewOptions: true, behaviour: "smooth"})
}

// ----------------------------------------
// function to do api calls
// ----------------------------------------
jct.jx = (route,q,after,api) => {
    let base_url = api ? api : jct.api;
    let url;
    if (route) {
        url = new URL(route, base_url);
    } else {
        url = new URL(base_url);
    }
    if (!q === false) {
        let searchParams = new URLSearchParams(q);
        for (const [key, value] of searchParams.entries()) {url.searchParams.append(key, value)};
    }
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url.href);
    xhr.send();
    xhr.onload = () => { xhr.status !== 200 ? jct.error(xhr) : (typeof after === 'function' ? after(xhr) : jct.success(xhr)); };
    xhr.onprogress = (e) => { jct.progress(e); };
    xhr.onerror = () => { jct.error(); };
}

// ----------------------------------------
// handy function to add html to elements
// ----------------------------------------
jct.htmlToElement = (html) => {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

// ----------------------------------------
// function to show detailed results
// ----------------------------------------
jct.d.show_detailed_results = () => {
    let explainResults = jct.d.gebi("jct_explain_results");
    if (explainResults) {
        explainResults.innerHTML = 'Hide explanation';
    }
    jct.d.gebi('jct_detailed_results').style.display = "flex";
    let print = jct.d.gebi('jct_print');
    if (print) {
        print.style.display = 'initial';
    }
}

// ----------------------------------------
// function to hide detailed results
// ----------------------------------------
jct.d.hide_detailed_results = () => {
    let explainResults = jct.d.gebi("jct_explain_results");
    if (explainResults) {
        explainResults.innerHTML = 'Explain this result';
    }
    jct.d.gebi('jct_detailed_results').style.display = "none";
    let print = jct.d.gebi('jct_print');
    if (print) {
        print.style.display = 'none';
    }
}

// ----------------------------------------
// function to toggle detailed results
// ----------------------------------------
jct.d.toggle_detailed_results = () => {
    let section = jct.d.gebi('jct_detailed_results');
    if (section.style.display === "none") {
        jct.d.show_detailed_results();
    } else {
        jct.d.hide_detailed_results();
    }
}

// ----------------------------------------
// function to check if the results obtained from the api
// are the same as the currently chosen user options
// ----------------------------------------
jct.result_equals_chosen = (js) => {
    // jct.chosen holds the current chosen object
    // js is the result request
    // The chosen journal id should exist in the list of ISSNs returned by the request. If no data, going with true
    let j_matches = (jct.chosen.journal && js.journal && js.journal[0]) ?
        (js.journal[0].issn.includes(jct.chosen.journal.id)) : true;
    // The funder ids should be equal. If no data, going with true
    let f_matches = (jct.chosen.funder && js.funder && js.funder[0]) ?
        (jct.chosen.funder.id === js.funder[0].id) : true;
    // The institution may not exist in case of notHE.
    // The institution ids should be equal. If no data, going with true
    let i_matches = (jct.chosen.institution && js.institution && js.institution[0]) ?
        (jct.chosen.institution.id === js.institution[0].id) : true;
    let result = j_matches && i_matches && f_matches;
    // Add missing details to jct.chosen (when a user doesn't select from drop down)
    if (result) {
        // Add missing details to jct.chosen.journal
        if (jct.chosen.journal && js.journal && js.journal[0]) {
            if (!jct.chosen.journal.title && js.journal[0].title) {
                jct.chosen.journal.title = js.journal[0].title
            }
            if (!jct.chosen.journal.publisher && js.journal[0].publisher) {
                jct.chosen.journal.publisher = js.journal[0].publisher
            }
        }
        // Add missing details to jct.chosen.funder
        if (jct.chosen.funder && js.funder && js.funder[0]) {
            if (!jct.chosen.funder.title && js.funder[0].title) {
                jct.chosen.funder.title = js.funder[0].title
            }
        }
        // Add missing details to jct.chosen.institution
        if (jct.chosen.institution && js.institution && js.institution[0]) {
            if (!jct.chosen.institution.title && js.institution[0].title) {
                jct.chosen.institution.title = js.institution[0].title
            }
        }
    }
    return result;
}

// ----------------------------------------
// function to apply default values to the select boxes
// and which runs the compliance check if all boxes are set
// ----------------------------------------
jct.set_each_default = (type, value) => {
    let doChoose = (selectedObject) => {
        jct.chosen[type] = selectedObject;
        jct._calculate_if_all_data_provided();
    }
    jct.clinputs[type].setChoice(value, doChoose);
}

// ----------------------------------------
// Setup JCT
// This maninly initializes clinput, CL's implementation of select 2
// ----------------------------------------
jct.clinputs = {};
jct.setup = (manageUrl=true) => {
    jct.setup_modals();
    jct.d.gebi("jct_inputs_plugin").innerHTML = jct.inputs_plugin_html;
    jct.inputs_offset = jct.d.gebi("jct_inputs_plugin").getBoundingClientRect().top
    jct.d.gebi("jct_results_plugin").innerHTML = jct.results_plugin_html;
    jct.d.gebi("jct_tiles_plugin").innerHTML = jct.tiles_plugin_html;
    let f = jct.d.gebi("jct_funder");
    jct.suggesting = true;

    window.onscroll = (e) => {
        let inputs = jct.d.gebi("jct_inputs_plugin")
        let label_height = jct.d.gebi("jct_journal-container").getElementsByTagName("label")[0].offsetHeight
        let currentScrollPos = window.pageYOffset
        x = window.matchMedia("(max-width: 767px)")
        if (currentScrollPos > jct.inputs_offset && !x.matches) {
            inputs.classList.add("sticky")
        }
        else {
            inputs.classList.remove("sticky")
        }

    }

    let scroll_to_top_if_sticky = () => {
        if (jct.d.gebi("jct_inputs_plugin").classList.contains("sticky")) {
            window.scrollTo(0, 0);
        }
    }

    jct.inputValues = {
        Journal: "",
        Funder: "",
        Institution: "",
        notHE: ""
    }

    jct.clinputs.journal = clinput.init({
        element: jct.d.gebi("jct_journal-container"),
        id: "jct_journal",
        label: "Journal",
        inputAttributes : {
            which: "journal",
            placeholder: "By ISSN or title",
            required: true,
            autocomplete: "off"
        },
        options : function(text, callback) {
            let pattern = /[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9xX]/;
            if (pattern.test(text)) {
                text = text.toUpperCase();
            } else {
                text = text.toLowerCase().replace(' of','').replace('the ','');
            }
            if (text.length > 1) {
                let ourcb = (xhr) => {
                    let js = JSON.parse(xhr.response);
                    callback(js.data);
                }
                jct.jx('/suggest/journal/'+text, false, ourcb);
            }
        },
        optionsTemplate : function(obj) {
            let t = obj.title;
            let issns = obj.issn.join(", ");
            let publisher = obj.publisher;
            let frag = "<a class='optionsTemplate'>";

            if (t) {
                frag += '<span class="jct__option_journal_title">' + t + '</span>';
            }
            if (publisher) {
                frag += ' <span class="jct__option_journal_publisher">(' + publisher + ')</span> ';
            }
            let issnPrefix = "";
            if (!t && !publisher) {
                issnPrefix = "ISSN: ";
            }
            frag += ' <span class="jct__option_journal_issn">' + issnPrefix + issns + '</span></a> ';

            // sgst += '<p class="select_option"><a class="button choose'+ '" which="' + jct.suggesting + '" title="' + t + '" id="' + suggs.data[s].id + '" href="#">' + t + '</a></p>';
            return frag;
        },
        selectedTemplate : function(obj) {
            let t = obj.title;
            let issns = obj.issn;
            let publisher = obj.publisher;

            let frag = "";
            if (t) {
                frag += t;
            }
            if (publisher) {
                frag += " (" + publisher + ")";
            }
            if (issns) {
                if (t || publisher) {
                    frag += ", ";
                }
                frag += "ISSN: " + issns.join(", ");
            }
            return frag;
        },
        onChoice: function(e,el) {
            jct.choose(e,el, "journal");
        },
        rateLimit: 400,
        optionsLimit: 10,
        allowClear: true,
        newValue: function(text) {
            let rx = /^\d{4}-\d{3}[\dXx]{1}$/
            let match = text.match(rx);
            if (match) {
                return {
                    issn: [text],
                    id: text
                }
            }
            return false;
        }
    });

    jct.clinputs.funder = clinput.init({
        element: jct.d.gebi("jct_funder-container"),
        id: "jct_funder",
        label: "My funder",
        inputAttributes : {
            which: "funder",
            placeholder: "By funder name",
            required: true,
            autocomplete: "off"
        },
        options : function(text, callback) {
            text = text.toLowerCase().replace(' of','').replace('the ','');
            if (text.length > 1) {
                let ourcb = (xhr) => {
                    let js = JSON.parse(xhr.response);
                    callback(js.data);
                }
                jct.jx('/suggest/funder/'+text, false, ourcb);
            }
        },
        optionsTemplate : function(obj) {
            let title = obj.title;
            return '<a class="optionsTemplate"><span class="jct__option_publisher_title">' + title + '</span>';
        },
        selectedTemplate : function(obj) {
            return obj.title;
        },
        onChoice: function(e,el) {
            jct.choose(e,el, "funder");
        },
        rateLimit: 400,
        optionsLimit: 10,
        allowClear: true,
    });

    jct.clinputs.institution = clinput.init({
        element: jct.d.gebi("jct_institution-container"),
        id: "jct_institution",
        label: "My institution",
        inputAttributes : {
            which: "institution",
            placeholder: "By ROR or name",
            required: true,
            autocomplete: "off"
        },
        options : function(text, callback) {
            text = text.toLowerCase().replace(' of','').replace('the ','');
            if (text.length > 1) {
                let ourcb = (xhr) => {
                    let js = JSON.parse(xhr.response);
                    callback(js.data);
                }
                jct.jx('/suggest/institution/'+text, false, ourcb);
            }
        },
        optionsTemplate : function(obj) {
            let frag = '<a class="optionsTemplate"><span class="jct__option_institution_title">' + obj.title + '</span>';
            if (obj.alternate && !(/^[a-zA-Z0-9 ]+$/.test(obj.alternate))) {
                // has alternate non-english title. Use it
                frag += '<span class="jct__option_institution_alt_title"> (' +  obj.alternate + ')</span>';
            }
            if (obj.country) {
                frag += '<span class="jct__option_institution_country">, ' + obj.country + '</span>';
            }
            if (obj.id) {
                frag += ' <span class="jct__option_institution_id"> (ROR:' + obj.id + ')</span>';
            }
            frag += '</a>'
            return frag;
        },
        selectedTemplate : function(obj) {
            let frag = obj.title;
            if (obj.alternate && !(/^[a-zA-Z0-9 ]+$/.test(obj.alternate))) {
                // has alternate non-english title. Use it
                frag += ' (' + obj.alternate + ')';
            }
            if (obj.country) {
                frag += ', ' + obj.country;
            }
            if (obj.id) {
                frag += ' (ROR:' + obj.id + ')';
            }
            return frag;
        },
        onChoice: function(e,el) {
            jct.choose(e,el, "institution");
        },
        rateLimit: 400,
        optionsLimit: 10,
        allowClear: true,
    });

    jct.d.gebi("jct_journal").addEventListener("click", scroll_to_top_if_sticky)
    jct.d.gebi("jct_funder").addEventListener("click", scroll_to_top_if_sticky)
    jct.d.gebi("jct_institution").addEventListener("click", scroll_to_top_if_sticky)

    jct.d.gebi("jct_notHE").addEventListener("click", (event) => {
        if (event.target.checked && jct.chosen.institution) {
            jct.clinputs.institution.clear();
            jct.chosen.institution = "";
        }
        jct._calculate_if_all_data_provided();
    })

    jct.d.gebi('jct_restart').addEventListener("click", (e) => {
        location.reload();
    })

    let explainResults = jct.d.gebi("jct_explain_results");
    if (explainResults) {
        explainResults.addEventListener("click", (e) => {
            jct.d.toggle_detailed_results();
        })
    }

    // if we've been given URL params, read them then reset the url
    if (manageUrl) {
        let urlParams = new URLSearchParams(window.location.search);
        let setDefault = false;
        if (urlParams.get("issn")) {
            jct.set_each_default('journal', urlParams.get("issn"));
            setDefault = true;
        }
        if (urlParams.get("funder")) {
            jct.set_each_default("funder", urlParams.get("funder"));
            setDefault = true;
        }
        if (urlParams.get("ror")) {
            jct.set_each_default("institution", urlParams.get("ror"));
            setDefault = true;
        }
        if (urlParams.get("not_he") && urlParams.get("not_he") === "true") {
            let not_he_element = jct.d.gebi('jct_notHE');
            if (not_he_element.checked === false) {
                not_he_element.click();
            }
            setDefault = true;
        }
        if (setDefault) {
            window.history.replaceState("", "", "/");
        }
    }
}
