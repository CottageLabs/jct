// ----------------------------------------
// Function to add plugin containers
// ----------------------------------------
jct.add_plugin_containers = () => {
    // ----------------------------------------
    // html for holding the query
    // ----------------------------------------
    let query_container_html = `
        <div class="query" id="jct_query">
            <div class="row row-inputs" id="jct_inputs_plugin"></div>
        </div>
    `;

    // ----------------------------------------
    // html for holding the result
    // ----------------------------------------
    let results_container_html = `
        <div class="container results" id="jct_results" style="display: none">
            <div id="jct_results_plugin"></div>
            <div id="jct_tiles_plugin"></div>
            <div class="row row--centered" style="display: none;" id="jct_detailed_results">
                <section class="col col--1of2" id="jct_detailed_results_section">
                </section>
            </div>
            <div class="row">
                <div class="col col--1of3">
                    <button class="button button--primary" id="jct_restart">
                        <svg width="30" height="25" viewBox="0 0 30 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.57592 9.07816L2.94589 10.4481C3.92217 4.80549 8.85311 0.5 14.7704 0.5C18.2125 0.5 21.4922 1.98062 23.7704 4.56246C24.1073 4.94462 24.0713 5.528 23.6891 5.86585C23.3079 6.20277 22.7245 6.16677 22.3857 5.78462C20.4584 3.59877 17.6817 2.34615 14.7704 2.34615C9.70014 2.34615 5.48545 6.08244 4.73523 10.9461L6.97131 9.8277C7.42823 9.5997 7.98208 9.78431 8.21008 10.2403C8.43808 10.6963 8.25346 11.2511 7.79746 11.4791L4.14234 13.3066C4.01456 13.3779 3.86813 13.4198 3.71225 13.4229L3.69346 13.4231C3.59256 13.4231 3.49231 13.4066 3.39684 13.3743C3.26521 13.3298 3.14264 13.2553 3.03992 13.1526L0.270692 10.3834C-0.0902308 10.0225 -0.0902308 9.43908 0.270692 9.07816C0.631615 8.71724 1.215 8.71724 1.57592 9.07816ZM5.77034 20.4385C8.04942 23.0194 11.3291 24.5 14.7703 24.5C20.6873 24.5 25.6181 20.1949 26.5947 14.5526L27.964 15.9218C28.144 16.1018 28.3803 16.1923 28.6166 16.1923C28.8529 16.1923 29.0892 16.1018 29.2692 15.9228C29.6301 15.5618 29.6301 14.9785 29.2692 14.6175L26.5271 11.8754C26.3584 11.6919 26.1165 11.5769 25.8473 11.5769C25.6855 11.5769 25.5336 11.6185 25.4015 11.6914L21.7424 13.5209C21.2864 13.7489 21.1018 14.3037 21.3298 14.7597C21.5587 15.2157 22.1135 15.3985 22.5686 15.1723L24.8055 14.0535C24.0555 18.9173 19.8407 22.6538 14.7703 22.6538C11.859 22.6538 9.08326 21.4012 7.15403 19.2163C6.81711 18.8351 6.23372 18.7972 5.85157 19.1351C5.46942 19.472 5.43249 20.0563 5.77034 20.4385Z" fill="#2B2B2B"/>
                        </svg>Start over
                    </button>
                </div>
                <div class="col col--2of3 col--right">
                    <button class="button button--secondary" id="jct_explain_results">Explain this result</button>
                    <button class="button button--secondary" id="jct_print" style="display:none">
                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7499 5.01722V6.50014H22.1271C23.1598 6.50014 23.9998 7.34088 23.9998 8.37362V18.8773C23.9998 19.91 23.1598 20.75 22.1271 20.75H18.7499V23.75C18.7499 24.1648 18.4146 24.5 17.9999 24.5H5.99995C5.58596 24.5 5.24996 24.1648 5.24996 23.75V20.75H1.87349C0.840744 20.75 0 19.91 0 18.8773V8.37362C0 7.34088 0.840744 6.50014 1.87349 6.50014H5.24996V1.25018C5.24996 0.836181 5.58596 0.500183 5.99995 0.500183H14.2333C14.3207 0.498254 14.4084 0.511562 14.4921 0.540107C14.6074 0.579397 14.71 0.64597 14.7923 0.732113L18.5179 4.45765C18.5769 4.51409 18.6268 4.58009 18.665 4.65315C18.7244 4.76675 18.7527 4.89227 18.7499 5.01722ZM14.9999 3.06066V4.25015H16.1894L14.9999 3.06066ZM17.9999 11.7501H5.99995H4.49997C4.08597 11.7501 3.74997 11.4141 3.74997 11.0001C3.74997 10.5861 4.08597 10.2501 4.49997 10.2501H5.24996V8.00013H1.87349C1.66724 8.00013 1.49999 8.16737 1.49999 8.37362V18.8773C1.49999 19.0828 1.66724 19.25 1.87349 19.25H5.24996V17.7501H4.49997C4.08597 17.7501 3.74997 17.4148 3.74997 17.0001C3.74997 16.5853 4.08597 16.2501 4.49997 16.2501H5.99995H17.9999H19.4999C19.9146 16.2501 20.2498 16.5853 20.2498 17.0001C20.2498 17.4148 19.9146 17.7501 19.4999 17.7501H18.7499V19.25H22.1271C22.3326 19.25 22.4998 19.0828 22.4998 18.8773V8.37362C22.4998 8.16737 22.3326 8.00013 22.1271 8.00013H18.7499V10.2501H19.4999C19.9146 10.2501 20.2498 10.5861 20.2498 11.0001C20.2498 11.4141 19.9146 11.7501 19.4999 11.7501H17.9999ZM17.2499 10.2501V5.75014H14.2499C13.8351 5.75014 13.4999 5.41415 13.4999 5.00015V2.00017H6.74995V10.2501H17.2499ZM17.2499 17.7501H6.74995V20V23H17.2499V17.7501ZM14.9999 21.0905H8.99993C8.58593 21.0905 8.24994 20.7553 8.24994 20.3405C8.24994 19.9258 8.58593 19.5905 8.99993 19.5905H14.9999C15.4146 19.5905 15.7499 19.9258 15.7499 20.3405C15.7499 20.7553 15.4146 21.0905 14.9999 21.0905ZM4.49997 14.75C4.30497 14.75 4.10997 14.6675 3.96747 14.5325C3.83247 14.39 3.74997 14.2025 3.74997 14C3.74997 13.7968 3.83247 13.6093 3.96747 13.4675C4.25247 13.1901 4.74746 13.1901 5.03246 13.4675C5.16746 13.6093 5.24996 13.805 5.24996 14C5.24996 14.195 5.16746 14.39 5.03246 14.5325C4.88996 14.6675 4.69496 14.75 4.49997 14.75Z" fill="white"/>
                        </svg>Print
                    </button>
                </div>
            </div>
            <section class="row row--centered">
                <p class="col col--1of2 alert">
                  The information provided by the <em>Journal Checker Tool</em> represents cOAlition S’s current
                  understanding in relation to the policies of the journals contained within it. We will endeavour to
                  keep it up to date and accurate, but we do not accept any liability in relation to any errors or omissions.
                </p>
            </section>
        </div>
    `;

    // ----------------------------------------
    // html for holding the modals
    // ----------------------------------------
    let modal_container_html = `
        <div id="jct_modal_container"></div>
    `;

    let plugin_div = jct.d.gebi("jct_plugin");
    if (plugin_div.children.length === 0) {
        plugin_div.innerHTML = query_container_html + results_container_html + modal_container_html;
    }
}

jct.set_each_default = (type, value) => {
    let doChoose = (selectedObject) => {
        jct.chosen[type] = selectedObject;
        jct._calculate_if_all_data_provided();
    }
    jct.clinputs[type].setChoice(value, doChoose);
}

// ----------------------------------------
// Function to initialize the plugin with values
// ----------------------------------------
jct.set_defaults = () => {
    if (jct_query_options && jct_query_options.journal) {
        jct.set_each_default('journal', jct_query_options.journal);
    }
    if (jct_query_options && jct_query_options.funder) {
        jct.set_each_default('funder', jct_query_options.funder);
    }
    if (jct_query_options && jct_query_options.not_he) {
        let not_he_element = jct.d.gebi('jct_notHE');
        if (not_he_element.checked === false) {
            not_he_element.click();
        }
    } else if (jct_query_options && jct_query_options.institution) {
        jct.set_each_default('institution', jct_query_options.institution);
    }
}

// ----------------------------------------
// Function to setup the plugin
// ----------------------------------------
jct.setup_plugin = () => {
    jct.add_plugin_containers();
    jct.setup();
    jct.set_defaults();
}
