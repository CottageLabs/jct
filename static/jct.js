// ----------------------------------------
// Initial definitions
// ----------------------------------------
let jct = {
    api: JCT_API_endpoint,
    delay: 500,
    cache: {},
    chosen: {},
    latest_response: null
};

jct.d = document;

jct.d.gebi = document.getElementById;

jct.d.gebc = document.getElementsByClassName;

// jct.MAX_SUGGS_LENGTHS = 10; // ToDo: Confirm this is not used?

jct.COMPLIANCE_ROUTES_SHORT = {
    fully_oa: "fully_oa",
    ta: "ta",
    tj: "tj",
    sa: "self_archiving"
}

jct.COMPLIANCE_ROUTES_LONG = {
    fully_oa: "Full open access",
    ta: "Transformative agreement",
    tj: "Transformative journal",
    self_archiving: "Self-archiving"
}

// jct.waiting = false; // ToDo: Confirm this is not used?

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
        <h2 data-aos="fade-up" data-aos-duration="2000" id="jct_compliant" style="display:none">
            <strong>Yes</strong>, this combination is <br>compliant.
            <br/><br/>
            What options do I have?
        </h2>
        <h2 data-aos="fade-up" data-aos-duration="2000" id="jct_notcompliant" style="display:none">
            <strong>No</strong>, this combination is <br>not compliant.
            <br/><br/>
            What can I do now?
        </h2>
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
// html for non compliant option
// ----------------------------------------
jct.non_compliant_options_html = `
    <h3 class="col">What can I do now?</h3>

    <div class="col col--1of4">
        <article class="card aos-init aos-animate" data-aos="fade-up" data-aos-duration="2000">
            <h4 class="label card__heading">Check with an alternative journal</h4>
            <p>Repeat your search with an alternative journals to see if it provides a route to compliance with your funder’s
            Plan S aligned open access policy.</p>
        </article>
    </div>

    <div class="col col--1of4">
        <article class="card aos-init aos-animate" data-aos="fade-up" data-aos-duration="2000">
            <h4 class="label card__heading">Check with a different funder</h4>
            <p>If your research was funded by multiple Plan S funders, repeat your search using the name of one of the other funders.
            The implementation timeline for Plan S aligned open access policies is not the same for all funders, therefore results may vary by funder.</p>
        </article>
    </div>

    <div class="col col--1of4">
        <article class="card aos-init aos-animate" data-aos="fade-up" data-aos-duration="2000">
            <h4 class="label card__heading">Check with a different institution</h4>
            <p>If you or other authors on your research article are affiliated with different institutions, repeat your
            search with these alternative institutions. Transformative agreements, are made between publishers and (consortia of)
            institutions. While the institution you searched does not currently have an agreement with the publisher of this
            journal, one of your collaborator’s institutions may do.</p>
        </article>
    </div>

    <div class="col col--1of4">
        <article class="card aos-init aos-animate" data-aos="fade-up" data-aos-duration="2000">
            <h4 class="label card__heading">Rights retention</h4>
            <p>cOAlition S has developed a Rights Retention Strategy to give researchers supported by a cOAlition S Funder
            the freedom to publish in their journal of choice, including subscription journals, whilst remaining fully compliant with Plan S.
            <a href="https://www.coalition-s.org/wp-content/uploads/2020/10/RRS_onepager.pdf" target="_blank">More information on how to use it is available here</a>.</p>
        </article>
    </div>
`;

// ----------------------------------------
// html for fully_oa tile in results
// Needs journal title
// ----------------------------------------
jct.fullyOA_tile = (journal_title) => {
    let fullyOA_tile_html = `
        <div class="col col--1of4">
            <article class="card" data-aos="fade-up" data-aos-duration="2000">
                <span class="card__icon"><svg width="16" height="22" viewbox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.75 4.8125V8.9375H1.71531C0.769312 8.9375 0 9.70681 0 10.6528V20.2806C0 21.2286 0.771375 22 1.71875 22H13.4056C14.3536 22 15.125 21.2286 15.125 20.2806V10.6528C15.125 9.70681 14.3557 8.9375 13.4097 8.9375H4.125V4.8125C4.125 2.91706 5.66706 1.375 7.5625 1.375C9.45794 1.375 11 2.91706 11 4.8125V6.1875C11 6.567 11.3073 6.875 11.6875 6.875C12.0677 6.875 12.375 6.567 12.375 6.1875V4.8125C12.375 2.15875 10.2156 0 7.5625 0C4.90875 0 2.75 2.15875 2.75 4.8125ZM1.71531 10.3125C1.52762 10.3125 1.375 10.4651 1.375 10.6528V20.2806C1.375 20.4703 1.52969 20.625 1.71875 20.625H13.4056C13.5953 20.625 13.75 20.4703 13.75 20.2806V10.6528C13.75 10.4651 13.5974 10.3125 13.4097 10.3125H1.71531ZM6.875 17.1875C6.875 17.5677 7.183 17.875 7.5625 17.875C7.942 17.875 8.25 17.5677 8.25 17.1875V13.75C8.25 13.3698 7.942 13.0625 7.5625 13.0625C7.183 13.0625 6.875 13.3698 6.875 13.75V17.1875Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label card__heading">
                  <a href="#" class="jct_open_preferred_modal"><em>Preferred</em></a><br/><br/>
                  Full <br>open access
                </h4>
                <p>Go ahead and submit. Remember to select a <a href="https://creativecommons.org/licenses/by/2.0/" target="blank" rel="noferrer noopener">CC BY licence</a> to ensure compliance.</p>
                <p><em>` + journal_title + `</em> is a fully open access journal.</p>
            </article>
        </div>`;
    return jct.htmlToElement (fullyOA_tile_html);
}

// ----------------------------------------
// html for transformative_agreement_tile in results
// needs journal and institution_title
// ----------------------------------------
jct.transformative_agreement_tile = (journal, institution_title) => {
    let transformative_agreement_tile_html = `
        <div class="col col--1of4">
            <article class="card" data-aos="fade-up" data-aos-duration="2000">
                <span class="card__icon"><svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 4.8125C0 5.192 0.308 5.5 0.6875 5.5H4.125V17.1875V19.25C4.125 20.7666 5.35838 22 6.875 22H19.25C20.7666 22 22 20.7666 22 19.25V17.1875C22 16.8073 21.6927 16.5 21.3125 16.5H19.25V2.75C19.25 1.23337 18.0166 0 16.5 0H2.75C1.23337 0 0 1.23337 0 2.75V4.8125ZM17.875 2.75C17.875 1.99169 17.2583 1.375 16.5 1.375H5.13107C5.36564 1.7797 5.5 2.24942 5.5 2.75V4.8125V17.1875V19.25C5.5 20.0083 6.11669 20.625 6.875 20.625C7.63331 20.625 8.25 20.0083 8.25 19.25V17.1875C8.25 16.8073 8.558 16.5 8.9375 16.5H17.875V2.75ZM9.625 17.875H18.5625H20.625V19.25C20.625 20.0083 20.0083 20.625 19.25 20.625H9.25607C9.49064 20.2203 9.625 19.7506 9.625 19.25V17.875ZM1.375 2.75C1.375 1.99169 1.99169 1.375 2.75 1.375C3.50831 1.375 4.125 1.99169 4.125 2.75V4.125H1.375V2.75ZM15.8125 5.5H7.5625C7.183 5.5 6.875 5.192 6.875 4.8125C6.875 4.433 7.183 4.125 7.5625 4.125H15.8125C16.1927 4.125 16.5 4.433 16.5 4.8125C16.5 5.192 16.1927 5.5 15.8125 5.5ZM7.5625 8.25H15.8125C16.1927 8.25 16.5 7.942 16.5 7.5625C16.5 7.183 16.1927 6.875 15.8125 6.875H7.5625C7.183 6.875 6.875 7.183 6.875 7.5625C6.875 7.942 7.183 8.25 7.5625 8.25ZM15.8125 11H7.5625C7.183 11 6.875 10.692 6.875 10.3125C6.875 9.933 7.183 9.625 7.5625 9.625H15.8125C16.1927 9.625 16.5 9.933 16.5 10.3125C16.5 10.692 16.1927 11 15.8125 11ZM7.5625 13.75H11.6875C12.0677 13.75 12.375 13.4427 12.375 13.0625C12.375 12.6823 12.0677 12.375 11.6875 12.375H7.5625C7.183 12.375 6.875 12.6823 6.875 13.0625C6.875 13.4427 7.183 13.75 7.5625 13.75Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">
                  <a href="#" class="jct_open_preferred_modal"><em>Preferred</em></a><br/><br/>
                  Transformative <br>agreement
                </h4>
                <p>Conditions may be in place around publishing through this agreement. <a href="#" id="jct_open_ta_modal">Make sure to read this information</a>.</p>
                <p><em>` + journal.title + `</em> is part of a transformative agreement between <em>` + journal.publisher + `</em> and <em>` + institution_title +`</em></p>
            </article>
        </div>`;
    return jct.htmlToElement(transformative_agreement_tile_html);
}

// ----------------------------------------
// html for transformative_journal_tile in results
// needs journal_title
// ----------------------------------------
jct.transformative_journal_tile = (journal_title) => {
    let transformative_journal_tile_html = `
        <div class="col col--1of4">
            <article class="card" data-aos="fade-up" data-aos-duration="2000">
                <span class="card__icon">
                    <svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3125 21.3125C10.3125 21.6927 10.6205 22 11 22C11.3795 22 11.6875 21.6927 11.6875 21.3125V0.6875C11.6875 0.308 11.3795 0 11 0C10.6205 0 10.3125 0.308 10.3125 0.6875V21.3125ZM8.25 19.25H1.71737C0.770687 19.25 0 18.4793 0 17.5326V4.455C0 3.51519 0.765188 2.75 1.705 2.75H8.18744C8.56694 2.75 8.87494 3.058 8.87494 3.4375C8.87494 3.817 8.56694 4.125 8.18744 4.125H1.705C1.52281 4.125 1.375 4.27281 1.375 4.455V17.5319C1.375 17.7176 1.53175 17.875 1.71737 17.875H8.25C8.6295 17.875 8.9375 18.1823 8.9375 18.5625C8.9375 18.9427 8.6295 19.25 8.25 19.25ZM19.3118 18.5625C19.3118 18.1844 19.6211 17.875 19.9993 17.875C20.3774 17.875 20.6868 18.1844 20.6868 18.5625C20.6868 18.9406 20.3774 19.25 19.9993 19.25C19.6211 19.25 19.3118 18.9406 19.3118 18.5625ZM17.2493 18.5625C17.2493 18.1844 17.5586 17.875 17.9368 17.875C18.3149 17.875 18.6243 18.1844 18.6243 18.5625C18.6243 18.9406 18.3149 19.25 17.9368 19.25C17.5586 19.25 17.2493 18.9406 17.2493 18.5625ZM15.1868 18.5625C15.1868 18.1844 15.4961 17.875 15.8743 17.875C16.2524 17.875 16.5618 18.1844 16.5618 18.5625C16.5618 18.9406 16.2524 19.25 15.8743 19.25C15.4961 19.25 15.1868 18.9406 15.1868 18.5625ZM13.1243 18.5625C13.1243 18.1844 13.4336 17.875 13.8118 17.875C14.1899 17.875 14.4993 18.1844 14.4993 18.5625C14.4993 18.9406 14.1899 19.25 13.8118 19.25C13.4336 19.25 13.1243 18.9406 13.1243 18.5625ZM20.6249 17.3731C20.6249 16.995 20.9343 16.6856 21.3124 16.6856C21.6905 16.6856 21.9999 16.995 21.9999 17.3731C21.9999 17.7588 21.6905 18.0606 21.3124 18.0606C20.9343 18.0606 20.6249 17.7581 20.6249 17.3731ZM20.6249 15.3106C20.6249 14.9325 20.9343 14.6231 21.3124 14.6231C21.6905 14.6231 21.9999 14.9325 21.9999 15.3106C21.9999 15.6963 21.6905 15.9981 21.3124 15.9981C20.9343 15.9981 20.6249 15.6956 20.6249 15.3106ZM20.6249 13.2481C20.6249 12.87 20.9343 12.5606 21.3124 12.5606C21.6905 12.5606 21.9999 12.87 21.9999 13.2481C21.9999 13.6338 21.6905 13.9356 21.3124 13.9356C20.9343 13.9356 20.6249 13.6331 20.6249 13.2481ZM20.6249 11.1925C20.6249 10.8075 20.9343 10.4981 21.3124 10.4981C21.6905 10.4981 21.9999 10.8075 21.9999 11.1925C21.9999 11.5706 21.6905 11.8731 21.3124 11.8731C20.9343 11.8731 20.6249 11.5706 20.6249 11.1925ZM20.6249 9.12313C20.6249 8.745 20.9343 8.4425 21.3124 8.4425C21.6905 8.4425 21.9999 8.745 21.9999 9.12313C21.9999 9.50813 21.6905 9.8175 21.3124 9.8175C20.9343 9.8175 20.6249 9.50813 20.6249 9.12313ZM20.6249 7.0675C20.6249 6.6825 20.9343 6.37313 21.3124 6.37313C21.6905 6.37313 21.9999 6.6825 21.9999 7.0675C21.9999 7.44562 21.6905 7.74813 21.3124 7.74813C20.9343 7.74813 20.6249 7.44562 20.6249 7.0675ZM20.6249 4.99813C20.6249 4.62 20.9343 4.3175 21.3124 4.3175C21.6905 4.3175 21.9999 4.62 21.9999 4.99813C21.9999 5.38312 21.6905 5.6925 21.3124 5.6925C20.9343 5.6925 20.6249 5.38312 20.6249 4.99813ZM20.3155 4.125H20.3086C19.9305 4.09062 19.6555 3.76063 19.683 3.3825C19.7174 3.00437 20.0474 2.7225 20.4324 2.75688H20.4255C20.8036 2.79125 21.0855 3.12125 21.058 3.49938C21.0236 3.85688 20.728 4.13188 20.3705 4.13188C20.359 4.13188 20.3473 4.12974 20.337 4.12785C20.3287 4.12635 20.3213 4.125 20.3155 4.125ZM17.6205 3.4375C17.6205 3.05938 17.9299 2.75 18.308 2.75C18.6861 2.75 18.9955 3.05938 18.9955 3.4375C18.9955 3.81562 18.6861 4.125 18.308 4.125C17.9299 4.125 17.6205 3.81562 17.6205 3.4375ZM15.558 3.4375C15.558 3.05938 15.8674 2.75 16.2455 2.75C16.6236 2.75 16.933 3.05938 16.933 3.4375C16.933 3.81562 16.6236 4.125 16.2455 4.125C15.8674 4.125 15.558 3.81562 15.558 3.4375ZM13.4955 3.4375C13.4955 3.05938 13.8049 2.75 14.183 2.75C14.5611 2.75 14.8705 3.05938 14.8705 3.4375C14.8705 3.81562 14.5611 4.125 14.183 4.125C13.8049 4.125 13.4955 3.81562 13.4955 3.4375Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">
                    <a href="#" class="jct_open_preferred_modal"><em>Preferred</em></a>
                    <br/><br/>
                    Transformative <br>journal
                </h4>
                <p>Select the open access publishing option with a <a href="https://creativecommons.org/licenses/by/2.0/" target="blank" rel="noferrer noopener">CC BY licence</a> to ensure compliance.</p>
                <p><em>` + journal_title + `</em> is a transformative journal</p>
                <img src="../static/img/icons/question.svg" alt="circle help icon" class="helpicon_img tile_help" id="jct_tj_modal_button">
            </article>
        </div>`;
    return jct.htmlToElement(transformative_journal_tile_html);
}

// ----------------------------------------
// html for self_archiving_tile in results
// needs journal_title
// ----------------------------------------
jct.self_archiving_tile = (journal_title) => {
    let self_archiving_tile_html = `
        <div class="col col--1of4">
            <article class="card" data-aos="fade-up" data-aos-duration="2000">
                <span class="card__icon">
                    <svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22 5.15831C22 5.98803 21.4085 6.68203 20.625 6.84086V20.2778C20.625 21.2273 19.8523 22 18.9028 22H3.09719C2.14775 22 1.375 21.2273 1.375 20.2778V6.84086C0.591483 6.68203 0 5.98803 0 5.15831V1.71669C0 0.77 0.77 0 1.71669 0H20.2833C21.23 0 22 0.77 22 1.71669V5.15831ZM20.2833 5.5H19.9375H2.0625H1.71669C1.52831 5.5 1.375 5.34669 1.375 5.15831V1.71669C1.375 1.52831 1.52831 1.375 1.71669 1.375H20.2833C20.4717 1.375 20.625 1.52831 20.625 1.71669V5.15831C20.625 5.34669 20.4717 5.5 20.2833 5.5ZM2.75 20.2778V6.875H19.25V20.2778C19.25 20.4689 19.0939 20.625 18.9028 20.625H3.09719C2.90606 20.625 2.75 20.4689 2.75 20.2778ZM7.5625 11H14.4375C14.8177 11 15.125 10.692 15.125 10.3125C15.125 9.933 14.8177 9.625 14.4375 9.625H7.5625C7.183 9.625 6.875 9.933 6.875 10.3125C6.875 10.692 7.183 11 7.5625 11Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">Self-archiving</h4>
                <p>Following acceptance deposit your author accepted manuscript in a repository without embargo and with <a href="https://creativecommons.org/licenses/by/2.0/" target="blank" rel="noferrer noopener">CC BY licence</a>.</p>
                <p><em>` + journal_title + `</em> has a Plan S aligned self-archiving policy.</p>
                <img src="../static/img/icons/question.svg" alt="circle help icon" class="helpicon_img tile_help" id="jct_sa_modal_button">
            </article>
        </div>`;
    return jct.htmlToElement(self_archiving_tile_html);
}

// ----------------------------------------
// html for self_archiving_using_rights_retention_tile in results
// needs journal_title
// ----------------------------------------
jct.sa_rights_retention_tile = (journal_title) => {
    let sa_rights_retention_tile_html = `
        <div class="col col--1of4">
            <article class="card" data-aos="fade-up" data-aos-duration="2000">
                <span class="card__icon">
                    <svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22 5.15831C22 5.98803 21.4085 6.68203 20.625 6.84086V20.2778C20.625 21.2273 19.8523 22 18.9028 22H3.09719C2.14775 22 1.375 21.2273 1.375 20.2778V6.84086C0.591483 6.68203 0 5.98803 0 5.15831V1.71669C0 0.77 0.77 0 1.71669 0H20.2833C21.23 0 22 0.77 22 1.71669V5.15831ZM20.2833 5.5H19.9375H2.0625H1.71669C1.52831 5.5 1.375 5.34669 1.375 5.15831V1.71669C1.375 1.52831 1.52831 1.375 1.71669 1.375H20.2833C20.4717 1.375 20.625 1.52831 20.625 1.71669V5.15831C20.625 5.34669 20.4717 5.5 20.2833 5.5ZM2.75 20.2778V6.875H19.25V20.2778C19.25 20.4689 19.0939 20.625 18.9028 20.625H3.09719C2.90606 20.625 2.75 20.4689 2.75 20.2778ZM7.5625 11H14.4375C14.8177 11 15.125 10.692 15.125 10.3125C15.125 9.933 14.8177 9.625 14.4375 9.625H7.5625C7.183 9.625 6.875 9.933 6.875 10.3125C6.875 10.692 7.183 11 7.5625 11Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">Self-archiving using rights retention</h4>
                <p>You have the right to self-archive the author accepted manuscript should you choose.
                More information on how available <a href="#" id="jct_open_sa_rr_modal">here</a>.</p>
            </article>
        </div>`;
    return jct.htmlToElement(sa_rights_retention_tile_html);
}

// ----------------------------------------
// html for transformative agreement modal
// ----------------------------------------
jct.ta_modal_html = `
    <div class="modal" id="jct_modal_ta" style="display: none">
        <div class="modal-content" id="jct_modal_ta_content">
            <header class="modal-header">
                <h2>Transformative agreements
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_ta">&times;</span>
                </h2>
            </header>
            <div>
                <p>Consult your institution’s library prior to submitting to this journal. </p>
                <p><em>Transformative agreements</em> may have eligibility criteria or limits on publication numbers
                    in place that the Journal Checker Tool is currently not able to check. </p>
                <p>A common eligibility criterion is that the corresponding author of the article must be at an
                    institution subscribing to the transformative agreement for the paper (determined via the use of an
                    institutional email address). If you are not the corresponding author, please repeat your search
                    with the corresponding author’s insitution to help validate the article’s eligibility.</p>
            </div>
        </div>
    </div>
`;

// ----------------------------------------
// html for transformative journal modal
// ----------------------------------------
jct.tj_modal_html = `
    <div class="modal" id="jct_modal_tj" style="display: none">
        <div class="modal-content" id="jct_modal_tj_content">
            <header class="modal-header">
                <h2>
                    Transformative journals
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_tj">&times;</span>
                </h2>
            </header>
            <div>
                <p>A <em>Transformative Journal</em> is a subscription/hybrid journal that is committed to transitioning
                    to a fully OA journal. It must gradually increase the share of OA content and offset subscription
                    income from payments for publishing services (to avoid double payments).</p>
                <p>Check with your funder if they are able to pay the article publishing charge for transformative journals.
                <a href="https://www.coalition-s.org/plan-s-funders-implementation/" target="_blank" rel="noferrer noopener">here</a>.</p>
            </div>
        </div>
    </div>
`;

// ----------------------------------------
// html for self archiving modal
// ----------------------------------------
jct.sa_modal_html = `
    <div class="modal" id="jct_modal_sa" style="display: none">
            <div class="modal-content" id="jct_modal_sa_content">
                <header class="modal-header">
                      <h2>Self-archiving
                          <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_sa">&times;</span>
                      </h2>
                </header>
                <div>
                    <p>Self-archiving is sometimes referred to as <em>green open access</em>.</p>
                    <p>Publish your article via the journals standard route and do not select any open access option (your
                        funder may not cover the cost if you do and it does not enable compliance). Following acceptance
                        of your peer reviewed manuscript, deposit the full text version of the author accepted manuscript
                        (the version that includes changes requested by peer-reviewers) to a repository without embargo and
                        under a <a href="https://creativecommons.org/licenses/by/2.0/" target="blank" rel="noferrer noopener">CC BY licence</a>.
                        Your funder may require you to archive your article in a specific repository.</p>
                </div>
            </div>
        </div>
`;

// ----------------------------------------
// html for self archiving using rights retention modal
// ----------------------------------------
jct.sa_rr_modal_html = `
    <div class="modal" id="jct_modal_sa_rr" style="display: none">
        <div class="modal-content" id="jct_modal_sa_rr_content">
            <header class="modal-header">
                <h2>Self-archiving using rights retention
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_sa_rr">&times;</span>
                </h2>
            </header>
            <div>
                <p><a href="https://www.coalition-s.org/" target="_blank" rel="noferrer noopener">cOAlition S</a> has
                    developed a Rights Retention Strategy to give researchers supported by a cOAlition S Funder the
                    freedom to publish in their journal of choice, including subscription journals, whilst remaining fully
                    compliant with Plan S. More information on how to use it is available
                    <a href="https://www.coalition-s.org/wp-content/uploads/2020/10/RRS_onepager.pdf" target="_blank" rel="noferrer noopener">here</a>.</p>
            </div>
        </div>
    </div>
`;

// ----------------------------------------
// html for preferred results modal
// ----------------------------------------
jct.preferred_modal_html = `
    <div class="modal" id="jct_modal_preferred" style="display: none">
        <div class="modal-content" id="jct_modal_preferred_content">
            <header class="modal-header">
                <h2>Preferred Route to OA
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_preferred">&times;</span>
                </h2>
            </header>
            <div>
                <p>The Version of Record (VoR) is different from the Author Accepted Manuscript (AAM). The AAM is the
                    version accepted for publication, including all changes made during peer review. The VoR contains all
                    the changes from the copyediting process, journal formatting/branding etc., but it is also the version
                    maintained and curated by the publisher, who has the responsibility to ensure that any corrections or
                    retractions are applied in a timely and consistent way.
                </p>
                <p>For these reasons, the preferred option is to ensure that the VoR is made Open Access. Where the VoR
                    can be made available in accordance with the Plan S principles, and there is a cost, many cOAlition S
                    Organisations make funding available to cover these costs.
                </p>
            </div>
        </div>
    </div>
`;

// ----------------------------------------
// html for help modal (what is PlanS)
// ----------------------------------------
jct.help_modal_html = `
    <div class="modal" id="jct_modal_help" style="display: none">
        <div class="modal-content" id="jct_modal_help_content">
            <header class="modal-header">
                <h2>What’s this?
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_help">&times;</span>
                </h2>
            </header>
            <div>
                <p>Plan S aims for full and immediate Open Access to peer-reviewed scholarly publications from research funded by public and private grants.
                  <a href="https://www.coalition-s.org/" target="_blank" rel="noferrer noopener">cOAlition S</a> is the
                  coalition of research funding and performing organisations that have committed to implementing Plan S.
                  The goal of cOAlition S is to accelerate the transition to a scholarly publishing system that is characterised
                  by immediate, free online access to, and largely unrestricted use and re-use (full Open Access) of scholarly publications. </p>
                <p>The Journal Checker Tool enables researchers to check whether they can comply with their funders Plan S
                aligned OA policy based on the combination of journal, funder(s) and the institution(s) affiliated with
                the research to be published. The tool currently only identifies routes to open access compliance for
                Plan S aligned policies.</p>
                <p>This is a <a href="https://www.coalition-s.org/" target="_blank" rel="noferrer noopener">cOAlition S</a> project.</p>
                <p>
                    <a href="/notices#privacy_notice">Privacy Notice</a> •
                    <a href="/notices#disclaimer_and_copyright">Disclaimer & Copyright</a>
                </p>
            </div>
        </div>
    </div>
`;

// ----------------------------------------
// html for feedback modal
// ----------------------------------------
jct.feedback_modal_html = `
    <div class="modal" id="jct_modal_feedback" style="display: none">
        <div class="modal-content" id="contact">
            <header class="modal-header">
                <h2>Feedback? Suggestion? Contact us here.
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_feedback">&times;</span>
                 </h2>
            </header>
            <p>This tool is delivered by <a href="https://cottagelabs.com/" target="blank" rel="noferrer noopener">Cottage Labs</a> on behalf of <a href="https://www.coalition-s.org/" target="_blank" rel="noferrer noopener">cOAlition S</a>. If you believe that there is an error in the result given by the tool or how the tool is functioning please use this form. We will respond within working 3 days.</p>
            <form id="contact_form">
                <div class="modal-inputs">
                    <label for="name">Name</label>
                    <input class="contact_input" type="text" id="name" name="name" placeholder="Your name..">
                </div>
                <div class="modal-inputs">
                    <label for="email">Email</label>
                    <input class="contact_input" type="email" id="email" name="email" placeholder="Your email..">
                </div>
                <div class="modal-inputs">
                    <label for="message">Comment</label>
                    <textarea class="contact_input" id="message" name="message" placeholder="Write something.."></textarea>
                </div>
                <div class="modal-inputs">
                    <button class="button button--primary contact_submit" type="submit">
                        <svg width="24" height="25" viewbox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.88002 24.4048C4.99391 24.4685 5.11979 24.5 5.24492 24.5C5.4165 24.5 5.58734 24.4416 5.72445 24.3269L10.9109 20.0044H14.2242C19.6018 20.0044 23.9768 15.6286 23.9768 10.2518C23.9768 4.87501 19.6018 0.5 14.225 0.5H9.75255C4.37501 0.5 0 4.87501 0 10.2518C0 13.8438 2.01854 17.1609 5.18872 18.8527L4.50389 23.6443C4.45968 23.9523 4.60953 24.2542 4.88002 24.4048ZM1.49855 10.2518C1.49855 5.70071 5.20071 1.99855 9.75255 1.99855H14.2242C18.7761 1.99855 22.4782 5.69996 22.4782 10.2518C22.4782 14.8036 18.7761 18.5058 14.2242 18.5058H10.6397C10.4644 18.5058 10.295 18.5672 10.1602 18.6789L6.26243 21.9277L6.74721 18.5298C6.79442 18.2016 6.62059 17.8824 6.32013 17.7438C3.39122 16.3891 1.49855 13.449 1.49855 10.2518ZM6.74347 8.01597H17.2333C17.6477 8.01597 17.9826 7.6803 17.9826 7.2667C17.9826 6.8531 17.6477 6.51743 17.2333 6.51743H6.74347C6.32987 6.51743 5.99419 6.8531 5.99419 7.2667C5.99419 7.6803 6.32987 8.01597 6.74347 8.01597ZM6.74347 14.0102H12.7377C13.152 14.0102 13.4869 13.6752 13.4869 13.2609C13.4869 12.8473 13.152 12.5116 12.7377 12.5116H6.74347C6.32987 12.5116 5.99419 12.8473 5.99419 13.2609C5.99419 13.6752 6.32987 14.0102 6.74347 14.0102ZM17.2333 11.0131H6.74347C6.32987 11.0131 5.99419 10.6774 5.99419 10.2638C5.99419 9.8502 6.32987 9.51452 6.74347 9.51452H17.2333C17.6477 9.51452 17.9826 9.8502 17.9826 10.2638C17.9826 10.6774 17.6477 11.0131 17.2333 11.0131Z" fill="black"></path>
                        </svg>
                        Send
                    </button>
                </div>
            </form>
            <div id="feedback_success" style="display: none;"><h1>Email sent successfully.</h1></div>
            <div id="feedback_error" style="display: none;"><h1>Ooops, something went wrong.</h1></div>
            <p>
                <a href="/notices#privacy_notice">Privacy Notice</a> •
                <a href="/notices#disclaimer_and_copyright">Disclaimer & Copyright</a>
            </p>
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
            jct.help_modal_html;
    }
    modal_div.innerHTML = modal_container_html;
}

// ----------------------------------------
// Function to setup modal on the page
// ----------------------------------------
jct.setup_modals = (only_feedback=false) => {
    let modal_div = jct.d.gebi("jct_modal_container");
    if (modal_div.children.length == 0) {
        // Add the modal html and event handlers
        jct.add_modal_containers(modal_div, only_feedback);

        if (jct.d.gebi('jct_open_help_modal')) {
            jct.d.gebi('jct_open_help_modal').addEventListener("click", (e) => {
                e.preventDefault();
                let modal = jct.d.gebi('jct_modal_help');
                modal.style.display = 'block';
            })
        }

        if (jct.d.gebi('feedback')) {
            jct.d.gebi('feedback').addEventListener("click", (e) => {
                e.preventDefault();
                let modal = jct.d.gebi('jct_modal_feedback')
                jct.d.gebi('message').value = "";
                jct.d.gebi('feedback_success').style.display = "none";
                jct.d.gebi('feedback_error').style.display = "none";
                modal.style.display = 'block';
            });
        }

        window.onclick = (e) => {
            let modals = [].slice.call(jct.d.gebc("modal"));
            if (modals.includes(e.target)){
                e.target.style.display = "none";
            }
        }

        jct.d.each("jct_modal_close", (el) => {
            el.addEventListener("click", (e) => {
                let id = e.target.getAttribute("data-id");
                let modal = document.getElementById(id);
                modal.style.display = "none";
            })
        })
    }
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
    jct._setComplianceTheme();
    if (jct.chosen.journal && jct.chosen.funder && (jct.chosen.institution || jct.d.gebi("jct_notHE").checked)) {
        jct.suggesting = false;
        let qr = {journal: jct.chosen.journal.id};
        qr.funder = jct.chosen.funder.id;
        if (jct.chosen.institution) {
            qr.institution = jct.chosen.institution.id;
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

    jct.d.gebi(js.compliant ? 'jct_compliant' : 'jct_notcompliant').style.display = 'block';
    jct.d.gebi('jct_explain_results').style.display = 'initial';
    jct.d.hide_detailed_results();
    jct.d.gebi("jct_results").style.display = 'block';
    if (js.compliant) {
        jct._setComplianceTheme(true);
        js.results.forEach((r) => {
            if (r.compliant === "yes") {
                jct.add_tile(r, jct.chosen)
            }
        })
    }
    else {
        jct._setComplianceTheme(false);
        jct._addNonCompliantOptions();
    }
    jct.explain(js)
}

// ----------------------------------------
// function to add non compliant html response
// ----------------------------------------
jct._addNonCompliantOptions = () => {
    jct.d.gebi("jct_paths_results").innerHTML = non_compliant_options_html;
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
// function to add an appropriate tile for each type of response
// ----------------------------------------
jct.add_tile = (result, data) => {
    let tile_type = result.route;
    let tile;
    let has_sa_rights_retention;
    switch(tile_type) {
        case jct.COMPLIANCE_ROUTES_SHORT.fully_oa:
            tile = jct.fullyOA_tile(data.journal.title);
            break;
        case jct.COMPLIANCE_ROUTES_SHORT.ta:
            tile = jct.transformative_agreement_tile(data.journal, data.institution.title);
            break;
        case jct.COMPLIANCE_ROUTES_SHORT.tj:
            tile = jct.transformative_journal_tile(data.journal.title);
            break;
        case jct.COMPLIANCE_ROUTES_SHORT.sa:
            has_sa_rights_retention = jct.sa_rights_retention_check(result);
            if (has_sa_rights_retention) {
                tile = jct.sa_rights_retention_tile(data.journal.title);
            } else {
                tile = jct.self_archiving_tile(data.journal.title);
            }
            break;
    }
    jct.d.gebi("jct_paths_results").append(tile);
    if (tile_type === jct.COMPLIANCE_ROUTES_SHORT.tj){
        jct.d.gebi('jct_tj_modal_button').addEventListener("click", () => {
            let modal = jct.d.gebi('jct_modal_tj')
            modal.style.display = 'block';
        })
    }
    else if (tile_type === jct.COMPLIANCE_ROUTES_SHORT.ta) {
        jct.d.gebi('jct_open_ta_modal').addEventListener("click", (e) => {
            e.preventDefault();
            let modal = jct.d.gebi('jct_modal_ta');
            modal.style.display = 'block';
        })
    }
    else if (tile_type === jct.COMPLIANCE_ROUTES_SHORT.sa){
        if (has_sa_rights_retention) {
            jct.d.gebi('jct_open_sa_rr_modal').addEventListener("click", (e) => {
                e.preventDefault();
                let modal = jct.d.gebi('jct_modal_sa_rr');
                modal.style.display = 'block';
            })
        } else {
            jct.d.gebi('jct_sa_modal_button').addEventListener("click", () => {
                let modal = jct.d.gebi('jct_modal_sa')
                modal.style.display = 'block';
            })
        }
    }
    let preferreds = jct.d.gebc("jct_open_preferred_modal");
    for (let i = 0; i < preferreds.length; i++) {
        let preferred = preferreds[i];
        preferred.addEventListener("click", (e) => {
            e.preventDefault();
            let modal = jct.d.gebi("jct_modal_preferred");
            modal.style.display = "block";
        });
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
    let searchParams = new URLSearchParams(q);
    for (const [key, value] of searchParams.entries()) {url.searchParams.append(key, value)};
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
    jct.d.gebi("jct_explain_results").innerHTML = 'Hide explanation';
    jct.d.gebi('jct_detailed_results').style.display = "flex";
    jct.d.gebi('jct_print').style.display = 'initial';
}

// ----------------------------------------
// function to hide detailed results
// ----------------------------------------
jct.d.hide_detailed_results = () => {
    jct.d.gebi("jct_explain_results").innerHTML = 'Explain this result';
    jct.d.gebi('jct_detailed_results').style.display = "none";
    jct.d.gebi('jct_print').style.display = 'none';
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
// are the same as the curently chosen user options
// ----------------------------------------
jct.result_equals_chosen = (js) => {
    // jct.chosen holds the current chosen object
    // js is the result request
    // The chosen journal id should exist in the list of ISSNs returned by the request. If no data, going with true
    j_matches = (jct.chosen.journal && js.journal && js.journal[0]) ?
                (js.journal[0].issn.includes(jct.chosen.journal.id)) : true;
    // The funder ids should be equal. If no data, going with true
    f_matches = (jct.chosen.funder && js.funder && js.funder[0]) ?
                (jct.chosen.funder.id === js.funder[0].id) : true;
    // The institution may not exist in case of notHE.
    // The institution ids should be equal. If no data, going with true
    i_matches = (jct.chosen.institution && js.institution && js.institution[0]) ?
                (jct.chosen.institution.id === js.institution[0].id) : true;
    return ( j_matches && i_matches && f_matches );
}

// ----------------------------------------
// ToDo: Not sure if this is used.
// ----------------------------------------
//jct.setTimer = () => {
//    jct._setComplianceTheme();
//    if (!jct.intervalID){
//        jct.intervalID = window.setInterval(sent_suggestion_request, jct.delay);
//    }
//}

// ----------------------------------------
// ToDo: Not sure if this is used.
// ----------------------------------------
//function sent_suggestion_request() {
//    let funderInput = jct.d.gebi("jct_funder");
//    let journalInput = jct.d.gebi("jct_journal");
//    let institutionInput = jct.d.gebi("jct_institution");
//
//    let change = false;
//    let focused;
//    if (funderInput === document.activeElement){
//        change = funderInput.value !== jct.inputValues.Funder;
//        jct.inputValues.Funder = funderInput.value;
//        focused = "jct_funder";
//    }
//    else if (journalInput === document.activeElement){
//        change = journalInput.value !== jct.inputValues.Journal;
//        jct.inputValues.Journal = journalInput.value;
//        focused = "jct_journal";
//    }
//    else if (institutionInput === document.activeElement){
//        change = institutionInput.value !== jct.inputValues.Institution;
//        jct.inputValues.Institution = institutionInput.value;
//        focused = "jct_institution";
//    }
//    else {
//        clearInterval(jct.intervalID);
//        jct.intervalID = null;
//        return;
//    }
//
//    if (change){
//        jct._sug(focused);
//    }
//}

// ----------------------------------------
// ToDo: Not sure if this is used.
// ----------------------------------------
//jct._sug = (focused) => {
//    jct.d.gebi('jct_suggest'+focused).innerHTML="";
//    jct.d.gebi('jct_detailed_results_section').innerHTML = "";
//    jct.d.gebi('jct_explain_results').style.display = "none";
//    jct.d.gebi('jct_detailed_results').style.display = "none";
//    jct.d.gebi('jct_paths_results').innerHTML = "";
//    //negatives only for dev
//    jct.suggesting = focused;
//    jct.suggest(focused);
//}

// ----------------------------------------
// Setup JCT
// This maninly initializes clinput, CL's implementation of select 2
// ----------------------------------------
jct.clinputs = {};
jct.setup = () => {
    AOS.init();
    jct.setup_modals();
    jct.d.gebi("jct_inputs_plugin").innerHTML = jct.inputs_plugin_html;
    jct.d.gebi("jct_results_plugin").innerHTML = jct.results_plugin_html;
    jct.d.gebi("jct_tiles_plugin").innerHTML = jct.tiles_plugin_html;
    let f = jct.d.gebi("jct_funder");
    jct.suggesting = true;
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
            text = text.toLowerCase().replace(' of','').replace('the ','');
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
                    issn: [text]
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
            let id = obj.id;
            let frag = '<a class="optionsTemplate"><span class="jct__option_publisher_title">' + title + '</span>';
            return frag;
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
            let title = obj.title;
            let id = obj.id;

            let frag = '<a class="optionsTemplate"><span class="jct__option_institution_title">' + title + '</span>';
            if (id) {
                frag += ' <span class="jct__option_publisher_id">(ROR:' + id + ')</span></a> ';
            }
            return frag;
        },
        selectedTemplate : function(obj) {
            let title = obj.title;
            let id = obj.id;

            let frag = title;
            if (id) {
                frag += ' (ROR:' + id + ')';
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

    // ToDo: Confirm this is not used?
    //how to change it to jct.d.gebc?
    // document.querySelectorAll(".select_option").forEach(item => {
    //     item.addEventListener("click", jct.choose);
    // });

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

    jct.d.gebi("jct_explain_results").addEventListener("click", (e) => {
        jct.d.toggle_detailed_results();
    })
}
