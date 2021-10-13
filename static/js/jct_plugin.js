
// -------- i_am_a_widget --------

window.JCT_WIDGET = true;



// -------- api_endpoint --------

window.JCT_API_endpoint = 'https://api.journalcheckertool.org';
window.JCT_UI_BASE_URL = "https://journalcheckertool.org";



// -------- clinput --------

let clinput = {};

clinput.CLInput = class {
    constructor(params) {
        this.timer = null;
        this.delay = params.rateLimit || 0;
        this.value = "";
        this.options_method = params.options;
        this.optionsTemplate = params.optionsTemplate;
        this.selectedTemplate = params.selectedTemplate;
        this.options = [];
        this.id = params.id;
        this.optionsLimit = params.optionsLimit || 0;
        this.element = params.element;
        this.onChoice = params.onChoice;
        this.newValueMethod = params.newValue || false;
        this.lastSearchValue = "";
        this.selectedObject = false;

        let label = params.label;
        let inputAttrs = params.inputAttributes;

        let attrs = []
        let keys = Object.keys(inputAttrs)
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = inputAttrs[key];
            attrs.push(key + "=\"" + val + "\"");
        }
        let attrsFrag = attrs.join(" ");

        this.element.innerHTML = '<label for="' + this.id + '">' + label + '</label> \
                <input type="text" id="' + this.id + '" name="' + this.id + '" which="' + this.id + '" ' + attrsFrag + '>\
                <div id="' + this.id + '--options"></div>';

        let input = document.getElementById(this.id);
        input.addEventListener("focus", () => {this.activateInput()});
        input.addEventListener("blur", () => {this.recordSearchValue()});
        input.addEventListener("keydown", (e) => {
            let entries = document.getElementsByClassName("clinput__option_"+this.id);
            let arrowPress = (code, entries) => {
                if(code === "ArrowDown"){
                    entries[0].focus();
                }
            }
            if (entries.length > 0) {
                this._dispatchForCode(event, arrowPress, entries);
            }
        });
    }

    setChoice(value, callback) {
        this.options_method(value, (data) => {
            this.optionsReceived(data, true)
            if (this.options.length > 0) {
                this.selectedObject = this.options[0];
                this.showSelectedObject();
            }
            callback(this.selectedObject);
        });
    }

    unsetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    recordSearchValue() {
        let input = document.getElementById(this.id);
        let newVal = input.value;
        if (newVal !== this.lastSearchValue) {
            this.lastSearchValue = input.value;
            this.selectedObject = false;
        }

        if (this.selectedObject) {
            this.showSelectedObject()
        } else {
            this._setInputValue("");
        }
    }

    _setInputValue(val) {
        let input = document.getElementById(this.id);
        input.value = val;
        input.setAttribute("title", val);
    }

    clear() {
        this._setInputValue("");
        this.selectedObject = false;
        this.lastSearchValue = "";
    }

    activateInput() {
        let input = document.getElementById(this.id);
        this._setInputValue(this.lastSearchValue);
        this.value = "";

        if (this.selectedObject) {
            let lsv = this.lastSearchValue.toLowerCase();
            let keys = Object.keys(this.selectedObject);

            keycheck:
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let v = this.selectedObject[key];
                if (Array.isArray(v)) {
                    for (var j = 0; j < v.length; j++) {
                        let ve = v[j];
                        if (ve.toLowerCase().includes(lsv)) {
                            this._setInputValue(ve);
                            break keycheck;
                        }
                    }
                } else {
                    if (v && v.toLowerCase().includes(lsv)) {
                        this._setInputValue(v);
                        break keycheck;
                    }
                }
            }
        }

        if (!this.timer) {
            this.timer = window.setInterval(() => {
                this.clearOptions();
                this.lookupOptions();
                // this.unsetTimer();
            }, this.delay);
        }
    }

    clearOptions() {
        let input = document.getElementById(this.id);
        if (document.activeElement === input) {
            return;
        }

        let entries = this.element.getElementsByClassName("clinput__option_" + this.id)
        for (let i = 0; i < entries.length; i++) {
            if (document.activeElement === entries[i]) {
                return;
            }
        }
        document.getElementById(this.id + "--options").innerHTML = "";
    }

    lookupOptions() {
        let input = document.getElementById(this.id);
        if (document.activeElement !== input) {
            return;
        }
        if (this.value !== input.value && input.value.length > 0) {
            this.value = input.value;
            this.options_method(this.value, (data) => {this.optionsReceived(data)});
        } else if (input.value.length === 0) {
            let optsContainer = document.getElementById(this.id + "--options");
            optsContainer.innerHTML = "";
        }
    }

    optionsReceived(data, silent) {
        if (silent === undefined) {
            silent = false;
        }
        if (!this.optionsLimit) {
            this.options = data;
        } else {
            this.options = data.slice(0, this.optionsLimit);
        }
        if (this.newValueMethod && this.options.length === 0) {
            let nv = this.newValueMethod(this.value);
            if (nv) {
                this.options = [nv].concat(this.options);
            }
        }
        if (!silent) {
            this._renderOptions();
        }
    }

    _dispatchForCode(event, callback, entries){
        let code;

        if (event.key !== undefined) {
            code = event.key;
        } else if (event.keyIdentifier !== undefined) {
            code = event.keyIdentifier;
        } else if (event.keyCode !== undefined) {
            code = event.keyCode;
        }

        callback(code, entries);
    };

    _renderOptions() {
        let optsContainer = document.getElementById(this.id + "--options")
        if (this.options.length === 0) {
            optsContainer.innerHTML = "";
            return;
        }

        let frag = "<ul class='clinput__options clinput__options_" + this.id + "'>";
        for (let s = 0; s < this.options.length; s++) {
            frag += '<li tabIndex=' + s + ' class="clinput__option clinput__option_' + this.id + '" data-idx=' + s + '">' + this.optionsTemplate(this.options[s]) + '</li>';
        }
        frag += '</ul>';
        optsContainer.innerHTML = frag;

        let entries = this.element.getElementsByClassName("clinput__option_" + this.id)

        for (let i = 0; i < entries.length; i++) {
            entries[i].addEventListener("mouseover", () => {
                this.setFocusToOption(entries, i);
            });
            entries[i].addEventListener("mouseout", () => {
                this.setFocusToOption(entries, i);
            });
            entries[i].addEventListener("click", (e) => {
                this.chooseOption(e,i);
            });
            entries[i].addEventListener("focus", () => {
                this._setInputValue(this.lastSearchValue);
            });
            entries[i].addEventListener("blur", () => {
                this.recordSearchValue();
            });
            entries[i].addEventListener("keydown", (e) => {
                let arrowPress = (code, entries) => {
                    let idx = parseInt(e.target.getAttribute("data-idx"));
                    if (entries.length !== 0) {
                        if (code === "ArrowDown") {
                            if (idx < entries.length - 1) {
                                entries[idx + 1].focus();
                                e.preventDefault();
                            }
                        } else if (code === "ArrowUp") {
                            this.selecting = true;
                            if (idx > 0) {
                                entries[idx - 1].focus();
                            } else {
                                document.getElementById(this.id).focus();
                            }
                        } else if (code === "Enter") {
                            this.selecting = true;
                            this.chooseOption(e,idx);
                        } else if (code === "Tab") {
                            this.selecting = true;
                            this.chooseOption(e,idx);
                            e.preventDefault();
                        }
                    }
                };
                this._dispatchForCode(event, arrowPress, entries);
            });
        }
    }

    chooseOption(e,idx){
        let input = document.getElementById(this.id);
        let options = document.getElementsByClassName("clinput__options_" + this.id);
        options[0].innerHTML = "";
        this.lastSearchValue = input.value;
        this.selectedObject = this.options[idx];
        this.showSelectedObject();
        this.onChoice(e,this.options[idx]);
    }

    setFocusToOption(elements, i){
        if (i < 0) {
            document.getElementById(this.id).focus();
        }
        else if (i < elements.length) {
            elements[i].focus();
        }
    }

    showSelectedObject() {
        this._setInputValue(this.selectedTemplate(this.selectedObject));
    }
}

clinput.init = (params) => {
    return new clinput.CLInput(params)
}


// -------- jct --------

// ----------------------------------------
// Initial definitions
// ----------------------------------------
let jct = {
    api: JCT_API_endpoint,
    host: JCT_UI_BASE_URL,
    delay: 500,
    cache: {},
    chosen: {},
    latest_response: null
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

jct.COMPLIANCE_ROUTES_LONG = {
    fully_oa: "Full open access",
    ta: "Transformative agreement",
    tj: "Transformative journal",
    self_archiving: "Self-archiving"
}

jct.ORDER_OF_TILES = ['fully_oa', 'ta', 'tj', 'sa', 'sa_rr']

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
        <h2  id="jct_compliant" style="display:none">
            The following publishing options are aligned with your funder’s OA policy.
        </h2>
        <h2  id="jct_notcompliant" style="display:none">
            There are no publishing options aligned with your funder’s OA policy.
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
    <div class="col col--1of4">
        <article class="card" >
            <h4 class="label card__heading">Check with an alternative journal</h4>
            <p>Repeat your search with an alternative journals to see if it provides a route to compliance with your funder’s
            Plan S aligned open access policy.</p>
        </article>
    </div>

    <div class="col col--1of4">
        <article class="card" >
            <h4 class="label card__heading">Check with a different funder</h4>
            <p>If your research was funded by multiple Plan S funders, repeat your search using the name of one of the other funders.
            The implementation timeline for Plan S aligned open access policies is not the same for all funders, therefore results may vary by funder.</p>
        </article>
    </div>

    <div class="col col--1of4">
        <article class="card" >
            <h4 class="label card__heading">Check with a different institution</h4>
            <p>If you or other authors on your research article are affiliated with different institutions, repeat your
            search with these alternative institutions. Transformative agreements, are made between publishers and (consortia of)
            institutions. While the institution you searched does not currently have an agreement with the publisher of this
            journal, one of your collaborator’s institutions may do.</p>
        </article>
    </div>

    <div class="col col--1of4">
        <article class="card" >
            <h4 class="label card__heading">Rights retention</h4>
            <p>cOAlition S has developed a Rights Retention Strategy to give researchers supported by a cOAlition S Funder
            the freedom to publish in their journal of choice, including subscription journals, whilst remaining fully compliant with Plan S.
            <a href="https://www.coalition-s.org/wp-content/uploads/2020/10/RRS_onepager.pdf" target="_blank"  rel="noopener">More information on how to use it is available here</a>.</p>
        </article>
    </div>
`;

// ----------------------------------------
// html for fully_oa tile in results
// ----------------------------------------
jct.fullyOA_tile = (_chosen_data, _qualifications) => {
    let fullyOA_tile_html = `
        <div class="col col--1of4">
            <article class="card" >
                <span class="card__icon"><svg width="16" height="22" viewbox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.75 4.8125V8.9375H1.71531C0.769312 8.9375 0 9.70681 0 10.6528V20.2806C0 21.2286 0.771375 22 1.71875 22H13.4056C14.3536 22 15.125 21.2286 15.125 20.2806V10.6528C15.125 9.70681 14.3557 8.9375 13.4097 8.9375H4.125V4.8125C4.125 2.91706 5.66706 1.375 7.5625 1.375C9.45794 1.375 11 2.91706 11 4.8125V6.1875C11 6.567 11.3073 6.875 11.6875 6.875C12.0677 6.875 12.375 6.567 12.375 6.1875V4.8125C12.375 2.15875 10.2156 0 7.5625 0C4.90875 0 2.75 2.15875 2.75 4.8125ZM1.71531 10.3125C1.52762 10.3125 1.375 10.4651 1.375 10.6528V20.2806C1.375 20.4703 1.52969 20.625 1.71875 20.625H13.4056C13.5953 20.625 13.75 20.4703 13.75 20.2806V10.6528C13.75 10.4651 13.5974 10.3125 13.4097 10.3125H1.71531ZM6.875 17.1875C6.875 17.5677 7.183 17.875 7.5625 17.875C7.942 17.875 8.25 17.5677 8.25 17.1875V13.75C8.25 13.3698 7.942 13.0625 7.5625 13.0625C7.183 13.0625 6.875 13.3698 6.875 13.75V17.1875Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label card__heading">
                  <a href="#" class="jct_open_preferred_modal"><em>Preferred</em></a><br/><br/>
                  Full <br>open access
                </h4>
                <p>Go ahead and submit. Remember to select a <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener">CC BY licence</a> to ensure compliance.</p>
                <p>Upon publication, you have the right to self-archive the final published article as an additional route to compliance rather than an alternative route. </p>
            </article>
        </div>`;
    return jct.htmlToElement (fullyOA_tile_html);
}

// ----------------------------------------
// html for transformative_agreement_tile in results
// needs journal, institution title and author qualification
// ----------------------------------------
jct.transformative_agreement_tile = (chosen_data, qualifications) => {
    let author_qualification = jct.author_qualification(qualifications)
    let title = chosen_data.journal.title ? chosen_data.journal.title : chosen_data.journal.id;
    let publisher = chosen_data.journal.publisher ? chosen_data.journal.publisher : 'the publisher';
    let institution = chosen_data.institution.title ? chosen_data.institution.title : 'the institution';
    let condition_text;
    if (author_qualification) {
        condition_text = `<p>` + author_qualification + `<br/><br/>` +
            `Other conditions may also be in place around publishing through this agreement. ` +
            `<a href="#" id="jct_open_ta_modal">Make sure to read this information</a>.</p>`
    } else {
        condition_text = `<p>Conditions may be in place around publishing through this agreement. ` +
            `<a href="#" id="jct_open_ta_modal">Make sure to read this information</a>.</p>`
    }
    let transformative_agreement_tile_html = `
        <div class="col col--1of4">
            <article class="card" >
                <span class="card__icon"><svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 4.8125C0 5.192 0.308 5.5 0.6875 5.5H4.125V17.1875V19.25C4.125 20.7666 5.35838 22 6.875 22H19.25C20.7666 22 22 20.7666 22 19.25V17.1875C22 16.8073 21.6927 16.5 21.3125 16.5H19.25V2.75C19.25 1.23337 18.0166 0 16.5 0H2.75C1.23337 0 0 1.23337 0 2.75V4.8125ZM17.875 2.75C17.875 1.99169 17.2583 1.375 16.5 1.375H5.13107C5.36564 1.7797 5.5 2.24942 5.5 2.75V4.8125V17.1875V19.25C5.5 20.0083 6.11669 20.625 6.875 20.625C7.63331 20.625 8.25 20.0083 8.25 19.25V17.1875C8.25 16.8073 8.558 16.5 8.9375 16.5H17.875V2.75ZM9.625 17.875H18.5625H20.625V19.25C20.625 20.0083 20.0083 20.625 19.25 20.625H9.25607C9.49064 20.2203 9.625 19.7506 9.625 19.25V17.875ZM1.375 2.75C1.375 1.99169 1.99169 1.375 2.75 1.375C3.50831 1.375 4.125 1.99169 4.125 2.75V4.125H1.375V2.75ZM15.8125 5.5H7.5625C7.183 5.5 6.875 5.192 6.875 4.8125C6.875 4.433 7.183 4.125 7.5625 4.125H15.8125C16.1927 4.125 16.5 4.433 16.5 4.8125C16.5 5.192 16.1927 5.5 15.8125 5.5ZM7.5625 8.25H15.8125C16.1927 8.25 16.5 7.942 16.5 7.5625C16.5 7.183 16.1927 6.875 15.8125 6.875H7.5625C7.183 6.875 6.875 7.183 6.875 7.5625C6.875 7.942 7.183 8.25 7.5625 8.25ZM15.8125 11H7.5625C7.183 11 6.875 10.692 6.875 10.3125C6.875 9.933 7.183 9.625 7.5625 9.625H15.8125C16.1927 9.625 16.5 9.933 16.5 10.3125C16.5 10.692 16.1927 11 15.8125 11ZM7.5625 13.75H11.6875C12.0677 13.75 12.375 13.4427 12.375 13.0625C12.375 12.6823 12.0677 12.375 11.6875 12.375H7.5625C7.183 12.375 6.875 12.6823 6.875 13.0625C6.875 13.4427 7.183 13.75 7.5625 13.75Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">
                  <a href="#" class="jct_open_preferred_modal"><em>Preferred</em></a><br/><br/>
                  Transformative <br>agreement
                </h4>` + condition_text +
        `<p><em>` + title + `</em> is part of a transformative agreement between <em>` + publisher + `</em> and <em>` + institution +`</em></p>
            </article>
        </div>`;
    return jct.htmlToElement(transformative_agreement_tile_html);
}

// ----------------------------------------
// html for transformative_journal_tile in results
// ----------------------------------------
jct.transformative_journal_tile = (_chosen_data, _qualifications) => {
    let transformative_journal_tile_html = `
        <div class="col col--1of4">
            <article class="card" >
                <span class="card__icon">
                    <svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3125 21.3125C10.3125 21.6927 10.6205 22 11 22C11.3795 22 11.6875 21.6927 11.6875 21.3125V0.6875C11.6875 0.308 11.3795 0 11 0C10.6205 0 10.3125 0.308 10.3125 0.6875V21.3125ZM8.25 19.25H1.71737C0.770687 19.25 0 18.4793 0 17.5326V4.455C0 3.51519 0.765188 2.75 1.705 2.75H8.18744C8.56694 2.75 8.87494 3.058 8.87494 3.4375C8.87494 3.817 8.56694 4.125 8.18744 4.125H1.705C1.52281 4.125 1.375 4.27281 1.375 4.455V17.5319C1.375 17.7176 1.53175 17.875 1.71737 17.875H8.25C8.6295 17.875 8.9375 18.1823 8.9375 18.5625C8.9375 18.9427 8.6295 19.25 8.25 19.25ZM19.3118 18.5625C19.3118 18.1844 19.6211 17.875 19.9993 17.875C20.3774 17.875 20.6868 18.1844 20.6868 18.5625C20.6868 18.9406 20.3774 19.25 19.9993 19.25C19.6211 19.25 19.3118 18.9406 19.3118 18.5625ZM17.2493 18.5625C17.2493 18.1844 17.5586 17.875 17.9368 17.875C18.3149 17.875 18.6243 18.1844 18.6243 18.5625C18.6243 18.9406 18.3149 19.25 17.9368 19.25C17.5586 19.25 17.2493 18.9406 17.2493 18.5625ZM15.1868 18.5625C15.1868 18.1844 15.4961 17.875 15.8743 17.875C16.2524 17.875 16.5618 18.1844 16.5618 18.5625C16.5618 18.9406 16.2524 19.25 15.8743 19.25C15.4961 19.25 15.1868 18.9406 15.1868 18.5625ZM13.1243 18.5625C13.1243 18.1844 13.4336 17.875 13.8118 17.875C14.1899 17.875 14.4993 18.1844 14.4993 18.5625C14.4993 18.9406 14.1899 19.25 13.8118 19.25C13.4336 19.25 13.1243 18.9406 13.1243 18.5625ZM20.6249 17.3731C20.6249 16.995 20.9343 16.6856 21.3124 16.6856C21.6905 16.6856 21.9999 16.995 21.9999 17.3731C21.9999 17.7588 21.6905 18.0606 21.3124 18.0606C20.9343 18.0606 20.6249 17.7581 20.6249 17.3731ZM20.6249 15.3106C20.6249 14.9325 20.9343 14.6231 21.3124 14.6231C21.6905 14.6231 21.9999 14.9325 21.9999 15.3106C21.9999 15.6963 21.6905 15.9981 21.3124 15.9981C20.9343 15.9981 20.6249 15.6956 20.6249 15.3106ZM20.6249 13.2481C20.6249 12.87 20.9343 12.5606 21.3124 12.5606C21.6905 12.5606 21.9999 12.87 21.9999 13.2481C21.9999 13.6338 21.6905 13.9356 21.3124 13.9356C20.9343 13.9356 20.6249 13.6331 20.6249 13.2481ZM20.6249 11.1925C20.6249 10.8075 20.9343 10.4981 21.3124 10.4981C21.6905 10.4981 21.9999 10.8075 21.9999 11.1925C21.9999 11.5706 21.6905 11.8731 21.3124 11.8731C20.9343 11.8731 20.6249 11.5706 20.6249 11.1925ZM20.6249 9.12313C20.6249 8.745 20.9343 8.4425 21.3124 8.4425C21.6905 8.4425 21.9999 8.745 21.9999 9.12313C21.9999 9.50813 21.6905 9.8175 21.3124 9.8175C20.9343 9.8175 20.6249 9.50813 20.6249 9.12313ZM20.6249 7.0675C20.6249 6.6825 20.9343 6.37313 21.3124 6.37313C21.6905 6.37313 21.9999 6.6825 21.9999 7.0675C21.9999 7.44562 21.6905 7.74813 21.3124 7.74813C20.9343 7.74813 20.6249 7.44562 20.6249 7.0675ZM20.6249 4.99813C20.6249 4.62 20.9343 4.3175 21.3124 4.3175C21.6905 4.3175 21.9999 4.62 21.9999 4.99813C21.9999 5.38312 21.6905 5.6925 21.3124 5.6925C20.9343 5.6925 20.6249 5.38312 20.6249 4.99813ZM20.3155 4.125H20.3086C19.9305 4.09062 19.6555 3.76063 19.683 3.3825C19.7174 3.00437 20.0474 2.7225 20.4324 2.75688H20.4255C20.8036 2.79125 21.0855 3.12125 21.058 3.49938C21.0236 3.85688 20.728 4.13188 20.3705 4.13188C20.359 4.13188 20.3473 4.12974 20.337 4.12785C20.3287 4.12635 20.3213 4.125 20.3155 4.125ZM17.6205 3.4375C17.6205 3.05938 17.9299 2.75 18.308 2.75C18.6861 2.75 18.9955 3.05938 18.9955 3.4375C18.9955 3.81562 18.6861 4.125 18.308 4.125C17.9299 4.125 17.6205 3.81562 17.6205 3.4375ZM15.558 3.4375C15.558 3.05938 15.8674 2.75 16.2455 2.75C16.6236 2.75 16.933 3.05938 16.933 3.4375C16.933 3.81562 16.6236 4.125 16.2455 4.125C15.8674 4.125 15.558 3.81562 15.558 3.4375ZM13.4955 3.4375C13.4955 3.05938 13.8049 2.75 14.183 2.75C14.5611 2.75 14.8705 3.05938 14.8705 3.4375C14.8705 3.81562 14.5611 4.125 14.183 4.125C13.8049 4.125 13.4955 3.81562 13.4955 3.4375Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">
                    <a href="#" class="jct_open_preferred_modal"><em>Preferred</em></a>
                    <br/><br/>
                    <span>Transformative <br>journal</span>
                    <span alt="circle help icon" class="helpicon_img tile_help" id="jct_open_tj_modal">
                        <svg width="25" height="25" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M120 62.5C120 94.2564 94.2564 120 62.5 120C30.7436 120 5 94.2564 5 62.5C5 30.7436 30.7436 5 62.5 5C94.2564 5 120 30.7436 120 62.5ZM125 62.5C125 97.0178 97.0178 125 62.5 125C27.9822 125 0 97.0178 0 62.5C0 27.9822 27.9822 0 62.5 0C97.0178 0 125 27.9822 125 62.5ZM56.293 78.1533V79.9238H60.2168V79.2539C60.2168 76.1595 60.4561 73.8307 60.9346 72.2676C61.445 70.7044 62.2425 69.221 63.3271 67.8174C64.4437 66.3818 66.0228 64.8027 68.0645 63.0801C69.8509 61.5807 71.4779 60.193 72.9453 58.917C74.4128 57.6091 75.6569 56.2692 76.6777 54.8975C77.7305 53.4938 78.5439 51.9785 79.1182 50.3516C79.6924 48.7246 79.9795 46.8265 79.9795 44.6572C79.9795 39.1702 78.3047 34.8636 74.9551 31.7373C71.6055 28.5791 67.0117 27 61.1738 27C58.6536 27 56.1973 27.2552 53.8047 27.7656C51.444 28.276 48.5091 29.2969 45 30.8281L46.7705 34.6562C49.3226 33.4121 51.6992 32.5189 53.9004 31.9766C56.1016 31.4023 58.4622 31.1152 60.9824 31.1152C65.321 31.1152 68.8141 32.3115 71.4619 34.7041C74.1416 37.0967 75.4814 40.3187 75.4814 44.3701C75.4814 46.8584 74.987 49.0596 73.998 50.9736C73.0091 52.8877 71.3662 54.8177 69.0693 56.7637L64.7148 60.5439C61.4928 63.3831 59.2757 66.0469 58.0635 68.5352C56.8831 71.0234 56.293 74.2295 56.293 78.1533ZM58.542 89.542C55.9899 89.542 54.7139 91.1051 54.7139 94.2314C54.7139 97.3577 55.9899 98.9209 58.542 98.9209C61.1579 98.9209 62.4658 97.3577 62.4658 94.2314C62.4658 91.1051 61.1579 89.542 58.542 89.542Z" fill="black"/>
                        </svg>
                    </span>
                </h4>
                <p>Go ahead and submit. Remember to select the open access publishing option with a <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener">CC BY licence</a> to ensure compliance.
                <p>Check <a href="https://www.coalition-s.org/plan-s-funders-implementation/" target="_blank" rel="noopener">here</a> to confirm if your funder will pay publishing fees.</p>
            </article>
        </div>`;
    return jct.htmlToElement(transformative_journal_tile_html);
}

// ----------------------------------------
// html for self_archiving_tile in results
// ----------------------------------------
jct.self_archiving_tile = (_chosen_data, _qualifications) => {
    let self_archiving_tile_html = `
        <div class="col col--1of4">
            <article class="card" >
                <span class="card__icon">
                    <svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22 5.15831C22 5.98803 21.4085 6.68203 20.625 6.84086V20.2778C20.625 21.2273 19.8523 22 18.9028 22H3.09719C2.14775 22 1.375 21.2273 1.375 20.2778V6.84086C0.591483 6.68203 0 5.98803 0 5.15831V1.71669C0 0.77 0.77 0 1.71669 0H20.2833C21.23 0 22 0.77 22 1.71669V5.15831ZM20.2833 5.5H19.9375H2.0625H1.71669C1.52831 5.5 1.375 5.34669 1.375 5.15831V1.71669C1.375 1.52831 1.52831 1.375 1.71669 1.375H20.2833C20.4717 1.375 20.625 1.52831 20.625 1.71669V5.15831C20.625 5.34669 20.4717 5.5 20.2833 5.5ZM2.75 20.2778V6.875H19.25V20.2778C19.25 20.4689 19.0939 20.625 18.9028 20.625H3.09719C2.90606 20.625 2.75 20.4689 2.75 20.2778ZM7.5625 11H14.4375C14.8177 11 15.125 10.692 15.125 10.3125C15.125 9.933 14.8177 9.625 14.4375 9.625H7.5625C7.183 9.625 6.875 9.933 6.875 10.3125C6.875 10.692 7.183 11 7.5625 11Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">Self-archiving
                    <span alt="circle help icon" class="helpicon_img tile_help" id="jct_open_sa_modal" >
                        <svg width="25" height="25" viewBox="0 0 125 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M120 62.5C120 94.2564 94.2564 120 62.5 120C30.7436 120 5 94.2564 5 62.5C5 30.7436 30.7436 5 62.5 5C94.2564 5 120 30.7436 120 62.5ZM125 62.5C125 97.0178 97.0178 125 62.5 125C27.9822 125 0 97.0178 0 62.5C0 27.9822 27.9822 0 62.5 0C97.0178 0 125 27.9822 125 62.5ZM56.293 78.1533V79.9238H60.2168V79.2539C60.2168 76.1595 60.4561 73.8307 60.9346 72.2676C61.445 70.7044 62.2425 69.221 63.3271 67.8174C64.4437 66.3818 66.0228 64.8027 68.0645 63.0801C69.8509 61.5807 71.4779 60.193 72.9453 58.917C74.4128 57.6091 75.6569 56.2692 76.6777 54.8975C77.7305 53.4938 78.5439 51.9785 79.1182 50.3516C79.6924 48.7246 79.9795 46.8265 79.9795 44.6572C79.9795 39.1702 78.3047 34.8636 74.9551 31.7373C71.6055 28.5791 67.0117 27 61.1738 27C58.6536 27 56.1973 27.2552 53.8047 27.7656C51.444 28.276 48.5091 29.2969 45 30.8281L46.7705 34.6562C49.3226 33.4121 51.6992 32.5189 53.9004 31.9766C56.1016 31.4023 58.4622 31.1152 60.9824 31.1152C65.321 31.1152 68.8141 32.3115 71.4619 34.7041C74.1416 37.0967 75.4814 40.3187 75.4814 44.3701C75.4814 46.8584 74.987 49.0596 73.998 50.9736C73.0091 52.8877 71.3662 54.8177 69.0693 56.7637L64.7148 60.5439C61.4928 63.3831 59.2757 66.0469 58.0635 68.5352C56.8831 71.0234 56.293 74.2295 56.293 78.1533ZM58.542 89.542C55.9899 89.542 54.7139 91.1051 54.7139 94.2314C54.7139 97.3577 55.9899 98.9209 58.542 98.9209C61.1579 98.9209 62.4658 97.3577 62.4658 94.2314C62.4658 91.1051 61.1579 89.542 58.542 89.542Z" fill="black"/>
                        </svg>
                    </span>
                </h4>
                <p>Upon acceptance, you can deposit your Author Accepted Manuscript in a repository without embargo and with a 
                <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener">CC BY licence</a>. Publishing fees do not apply with this route. </p>
            </article>
        </div>`;
    return jct.htmlToElement(self_archiving_tile_html);
}

// ----------------------------------------
// html for self_archiving_using_rights_retention_tile in results
// ----------------------------------------
jct.sa_rights_retention_tile = (_chosen_data, _qualifications) => {
    let sa_rights_retention_tile_html = `
        <div class="col col--1of4">
            <article class="card" >
                <span class="card__icon">
                    <svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22 5.15831C22 5.98803 21.4085 6.68203 20.625 6.84086V20.2778C20.625 21.2273 19.8523 22 18.9028 22H3.09719C2.14775 22 1.375 21.2273 1.375 20.2778V6.84086C0.591483 6.68203 0 5.98803 0 5.15831V1.71669C0 0.77 0.77 0 1.71669 0H20.2833C21.23 0 22 0.77 22 1.71669V5.15831ZM20.2833 5.5H19.9375H2.0625H1.71669C1.52831 5.5 1.375 5.34669 1.375 5.15831V1.71669C1.375 1.52831 1.52831 1.375 1.71669 1.375H20.2833C20.4717 1.375 20.625 1.52831 20.625 1.71669V5.15831C20.625 5.34669 20.4717 5.5 20.2833 5.5ZM2.75 20.2778V6.875H19.25V20.2778C19.25 20.4689 19.0939 20.625 18.9028 20.625H3.09719C2.90606 20.625 2.75 20.4689 2.75 20.2778ZM7.5625 11H14.4375C14.8177 11 15.125 10.692 15.125 10.3125C15.125 9.933 14.8177 9.625 14.4375 9.625H7.5625C7.183 9.625 6.875 9.933 6.875 10.3125C6.875 10.692 7.183 11 7.5625 11Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">Compliance through self-archiving using rights retention</h4>
                <p>Your funder’s grant conditions set out how you can retain sufficient rights to self-archive the Author
                   Accepted Manuscript in any OA repository. Publishing fees do not apply with this route.</p>
                   <p><a href="#" id="jct_open_sa_rr_modal">More information</a></p>
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
                <p>Check <a href="https://www.coalition-s.org/plan-s-funders-implementation/" target="_blank" rel="noopener">here</a> to confirm if your funder will pay publishing fees.</p>
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
                    <p>Self-archiving is sometimes referred to as <em>green open access</em>. Publishing fees do not apply 
                    with this route.</p>
                    <p>Publish your article via the journal’s standard route and do not select an open access option. 
                    Following acceptance, deposit the full text version of the author accepted manuscript (the version 
                    that includes changes requested by peer-reviewers) to a repository without embargo and under a 
                    <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener">CC BY licence</a>. 
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
                <h2>Compliance through self-archiving using rights retention
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_sa_rr">&times;</span>
                </h2>
            </header>
            <div>
                <p>The cOAlition S <a href="https://www.coalition-s.org/wp-content/uploads/2020/10/RRS_onepager.pdf" target="_blank" rel="noopener">Rights Retention Strategy</a>
                 sets out how you can retain sufficient rights to self-archive your Author Accepted Manuscript in any OA 
                 repository at the time of publication with a CC BY license. When using this route to make your research 
                 articles OA, no fees are payable to the publisher.</p>
                 <p>Some subscription publishers may impose conditions -- via the License to Publish Agreement or otherwise 
                 -- that prevent you from meeting your funders' OA requirements. Authors should check publication terms 
                 before submitting a manuscript and should not sign a publishing contract that conflicts with funder 
                 conditions. Contact your funder for more information and guidance.</p>
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
                  <a href="https://www.coalition-s.org/" target="_blank" rel="noopener">cOAlition S</a> is the
                  coalition of research funding and performing organisations that have committed to implementing Plan S.
                  The goal of cOAlition S is to accelerate the transition to a scholarly publishing system that is characterised
                  by immediate, free online access to, and largely unrestricted use and re-use (full Open Access) of scholarly publications. </p>
                <p>The Journal Checker Tool enables researchers to check whether they can comply with their funders Plan S
                aligned OA policy based on the combination of journal, funder(s) and the institution(s) affiliated with
                the research to be published. The tool currently only identifies routes to open access compliance for
                Plan S aligned policies.</p>
                <p>This is a <a href="https://www.coalition-s.org/" target="_blank" rel="noopener">cOAlition S</a> project.</p>
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
            <p>This tool is delivered by <a href="https://cottagelabs.com/" target="_blank" rel="noopener">Cottage Labs</a> on behalf of <a href="https://www.coalition-s.org/" target="_blank" rel="noopener">cOAlition S</a>. </p>
            <p>If you believe that there is an error in the result given by the tool or how the tool is functioning please use this form. Your current search details will be automatically included in your feedback. We will respond within 3 working days.</p>
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
jct.setup_modals = (only_feedback=false) => {
    let modal_div = jct.d.gebi("jct_modal_container");
    if (modal_div.children.length === 0) {
        // Add the modal html and event handlers
        jct.add_modal_containers(modal_div, only_feedback);

        if (jct.d.gebi('feedback')) {
            jct.setup_feedback_modal();
        }

        if (jct.d.gebi('jct_open_help_modal')) {
            jct.d.gebi('jct_open_help_modal').addEventListener("click", (e) => {
                e.preventDefault();
                let modal = jct.d.gebi('jct_modal_help');
                modal.style.display = 'block';
            })
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
        let tiles_to_display = jct.get_tiles_to_display(js.results)
        jct.display_tiles(tiles_to_display);
    }
    else {
        jct._setComplianceTheme(false);
        jct._addNonCompliantOptions();
    }

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
            if (key === 'corresponding_authors' && key in jct.api_codes.qualification_ids &&
                'description' in jct.api_codes.qualification_ids[key]) {
                author_qualification = jct.api_codes.qualification_ids[key]['description'];
            }
        }
    }
    return author_qualification;
}

// ----------------------------------------
// function to get tiles to display
// ----------------------------------------
jct.get_tiles_to_display = (results) => {
    let tiles_to_display = {}
    let has_fully_oa = jct.fully_oa_check(results);
    results.forEach((r) => {
        if (r.compliant === "yes") {
            switch (r.route) {
                case jct.COMPLIANCE_ROUTES_SHORT.fully_oa:
                    tiles_to_display['fully_oa'] = r
                    break;
                case jct.COMPLIANCE_ROUTES_SHORT.ta:
                    tiles_to_display['ta'] = r
                    break;
                case jct.COMPLIANCE_ROUTES_SHORT.tj:
                    tiles_to_display['tj'] = r
                    break;
                case jct.COMPLIANCE_ROUTES_SHORT.sa:
                    if (!has_fully_oa) {
                        let has_sa_rights_retention = jct.sa_rights_retention_check(r);
                        if (has_sa_rights_retention) {
                            tiles_to_display['sa_rr'] = r
                        } else {
                            tiles_to_display['sa'] = r
                        }
                    }
                    break;
            }
        }
    })
    if ('fully_oa' in tiles_to_display && 'sa' in tiles_to_display) {
        delete tiles_to_display.sa;
    }
    return tiles_to_display;
}

// ----------------------------------------
// Function to display the selected list of tiles
// ----------------------------------------
jct.display_tiles = (tiles_to_display) => {
    let chosen_data = jct.chosen;
    jct.ORDER_OF_TILES.forEach((tile_name) => {
        if (tile_name in tiles_to_display) {
            let result = tiles_to_display[tile_name];
            let tile = jct.display_tile(tile_name, chosen_data, result);
            jct.d.gebi("jct_paths_results").append(tile);
            jct.activate_tile_modal(tile_name);
        }
    })
    jct.activate_preferred_modal();
}

// ----------------------------------------
// Function to display specific tile
// ----------------------------------------
jct.display_tile = (tile_name, chosen_data, result) => {
    let tile;
    switch (tile_name) {
        case 'fully_oa':
            tile = jct.fullyOA_tile(chosen_data, result.qualifications);
            break;
        case 'ta':
            tile = jct.transformative_agreement_tile(chosen_data, result.qualifications);
            break;
        case 'tj':
            tile = jct.transformative_journal_tile(chosen_data, result.qualifications);
            break;
        case 'sa':
            tile = jct.self_archiving_tile(chosen_data, result.qualifications);
            break;
        case 'sa_rr':
            tile  = jct.sa_rights_retention_tile(chosen_data, result.qualifications);
            break;
    }
    return tile;
}

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



// -------- api_codes --------

jct.api_codes = {
    type_ids: {
        'fully_oa':                 'Open Access Journal Route',
        'self_archiving':           'Self Archiving Route',
        'ta':                       'Transformative Agreement Route',
        'tj':                       'Transformative Journal Route'
     },
    compliance_ids: {
        'yes':                      'Route offers compliance',
         'no':                      'Route does not offer compliance',
         'unknown':                 'Not known if route offers compliance'
    },
    qualification_ids: {
        'name':                     'Please note,',
        'doaj_under_review': {
            description:            'this journal is currently under review for potential inclusion in DOAJ, it is yet to be ' +
                                    'approved for inclusion within the public DOAJ database.',
        },
        'rights_retention_author_advice': {
            description:            'your funder supports you to use the <a href="https://www.coalition-s.org/faq-theme/rights-licences/" target="_blank"  rel="noopener">'+'' +
                                    'cOAlition S rights retention strategy</a> as a route to compliance irrespective of the journal\'s self-archiving policy.',
        },
        'corresponding_authors': {
            description:            'The corresponding author of the submitted article must be based at '+
                                    'an institution within this transformative agreement for it to provide a route to compliance.',
        },
        'journal' : {
            description:            'a transformative agreement is currently in force for this journal.',
            start_date:             'Start date of the transformative agreement:',
            end_date:               'End date of the transformative agreement:'
        },
        'institution':  {
            description:            'a transformative agreement is currently in force for this institution.',
            start_date:             'Start date of the transformative agreement:',
            end_date:               'End date of the transformative agreement:'
        }
    },
    fully_oa: {
        'name':                     'Open Access Journal Route',
        'statement': {
            'yes':                  'You are able to comply with Plan S as this is a fully open access journal.',
            'no':                   'You are not able to <b>comply with Plan S</b> via the fully open access journal route.',
            'unknown':              'We are <b>unable to determine if you are complaint</b> via the fully open access journal route.',
        },
        'explanation': {
            'yes':                  'The following checks in the Directory of Open Access Journals (DOAJ) were carried ' +
                                    'out to determine if your chosen journal is an open access journal that enables compliance:',
            'no':                   'The following checks in the Directory of Open Access Journals (DOAJ) were carried out ' +
                                    'to determine that this is not a route to compliance:',
            'unknown':              'The following checks in the Directory of Open Access Journals (DOAJ) were carried out to determine compliance:',
        },
        'FullOA.NotInDOAJ':         'This journal is not present in DOAJ.',
        'FullOA.InProgressDOAJ':    'This journal is currently under review for potential inclusion in DOAJ.',
        'FullOA.NotInProgressDOAJ': 'This journal is not currently under review at DOAJ.',
        'FullOA.InDOAJ':            'This journal is present in DOAJ.',
        'FullOA.Compliant':         'This journal enables you to publish under the following licences that are supported by your funder\'s policy:',
            'FullOA.Compliant.Properties': {
            'licence':              ''
        },
        'FullOA.Unknown':           'We were unable to determine if this journal provides a route to compliance.',
        'FullOA.Unknown.Properties': {
            'missing':              'The following required information was missing from the DOAJ record:'
        },
        'FullOA.NonCompliant':      'This journal does not enable you to publish under a CC BY or equivalent licence required for policy compliance.',
        'FullOA.NonCompliant.Properties': {
            'licence':               'The licences allowed by this journal are:'
        },
    },
    self_archiving: {
        'name':                     'Self Archiving Route',
        'statement': {
            'yes':                  'You are able to comply with Plan S via Self-archiving.',
            'no':                   'Self-archiving does not enable <b>Plan S</b> compliance when publishing in this journal.',
            'unknown':              'We are <b>unable to determine</b> if you are able to comply with Plan S via Self-archiving, when publishing in this journal.',
        },
        'explanation': {
            'yes':                  "The following checks were carried out to determine whether the right exists to comply with " +
                                    "Plan S via self-archiving. Data from Open Access Button Permissions (OAB Permissions) is used " +
                                    "to see if the publisher's policy of self-archiving enables compliance. If it does not or if an " +
                                    "unknown answer has been returned then the cOAlition S Implementation Roadmap data is checked " +
                                    "to see if cOAlition S's Rights Retention Strategy provides a route to compliance:",
            'no':                   'The following checks were carried out to determine that this is not a compliant route:',
            'unknown':              'The following checks were carried out to determine compliance:',
        },
        'SA.InOAB':                 'This journal is present in OAB Permissions.',
        'SA.NotInOAB':              'This journal is not present in OAB Permissions.',
        'SA.OABNonCompliant':       "This journal's self-archiving policy does not enable compliance with your funder's open access policy, for the following reason(s):",
        'SA.OABNonCompliant.Properties': {
            'version':              'The manuscript version that can be archived is:',
            'embargo':              'There is an embargo period (in months):',
            'licence':              'The licence that can be used on the manuscript to be archived is:'
        },
        'SA.OABIncomplete':         'We were unable to determine if this journal provides a route to compliance.',
        'SA.OABIncomplete.Properties': {
            'missing':               'The following required information was missing from the OAB Permissions database:',
        },
        'SA.OABCompliant':          "This journals self-archiving policy aligns with your funder's open access policy.",
        'SA.OABCompliant.Properties': {
            'version':              'The manuscript version that can be archived is:',
            'embargo':              'There is an embargo period (in months):',
            'licence':              'The licence that can be used on the manuscript to be archived is:'
        },
        'SA.FunderRRNotActive': 	'Your funder has not implemented the ' +
                                    '<a href="https://www.coalition-s.org/faq-theme/rights-licences/" target="_blank"  rel="noopener">Plan S Rights Retention Strategy</a>.',
        'SA.FunderRRActive':        'Your funder has implemented the ' +
                                    '<a href="https://www.coalition-s.org/faq-theme/rights-licences/" target="_blank"  rel="noopener">Plan S Rights Retention Strategy</a>. ' +
                                    'Rights retention takes precedence over the journal\'s self-archiving policy. It provides a route to ' +
                                    'compliance irrespective of publisher imposed restrictions or embargo periods.',
        'SA.Unknown':               'We are unable to determine if this journal provides a route to compliance via self-archiving due to missing information.',
        'SA.NonCompliant':          'Self-archiving is not a route to compliance when publishing in this journal.',
        'SA.Compliant':             'Self-archiving can be a route to compliance when publishing in this journal.'
    },
    ta: {
        'name':                     'Transformative Agreement Route',
        'statement': {
            'yes':                  'You are able to comply with Plan S via a Transformative Agreement.',
            'no':                   'You are not able to <b>comply with Plan S</b> via a Transformative Agreement.',
            'unknown':              'We are <b>unable to determine</b> if you are able to comply with Plan S via a Transformative Agreement.',
        },
        'explanation': {
            'yes':                  'The following checks were carried out on the JCT\'s Transformative Agreement Index to ' +
                                    'determine if a Transformative Agreement is available that would enable compliance:',
            'no':                   'The following checks were carried out on the JCT\'s Transformative Agreement Index to ' +
                                    'determine if a Transformative Agreement is available that would enable compliance:',
            'unknown':              'The following checks were carried out on the JCT\'s Transformative Agreement Index to determine compliance:',
        },
        'TA.NoTA':                  'No Transformative Agreement containing the selected journal and institution was found within our database.',
        'TA.Exists':                'A Transformative Agreement containing the selected journal and institution was found within our database.',
        'TA.NotActive':             'Our database shows that the Transformative Agreement containing the selected journal and institution has expired.',
        'TA.Active':                'Our database shows that the Transformative Agreement containing the selected journal and institution is active.',
        'TA.Unknown':               'We do not have sufficient information to determine if a Transformative Agreement is available to provide a route to compliance.',
        'TA.NonCompliant':          'There is no Transformative Agreement available to provide a route to compliance.',
        'TA.Compliant':             'A Transformative Agreement is available that can provide a route to compliance.',
    },
    tj: {
        'name':                     'Transformative Journal Route',
        'statement': {
            'yes':                  'This journal is a Transformative Journal and therefore you <b>can comply with Plan S</b> via this route.',
            'no':                   'This journal is not a Transformative Journal and therefore you <b>cannot comply with Plan S</b> via this route.',
            'unknown':              'We are unable to determine if this journal is a Transformative Journal and therefore <b>unable to determine compliance</b> via this route.',
        },
        'explanation': {
            'yes':                  'The following checks were carried out on the JCT\'s Transformative Journal Index to determine that this is a compliant route:',
            'no':                   'The following checks were carried out on the JCT\'s Transformative Journal Index to determine that this is not a compliant route:',
            'unknown':              'The following checks were carried out on the JCT\'s Transformative Journal Index to determine compliance:',
        },
        'TJ.NoTJ':                  'This journal is not a Transformative Journal.',
        'TJ.Exists':                'This journal is a Transformative Journal.',
        'TJ.NonCompliant':          'As this journal is not a Transformative Journal, this route to compliance is not available.',
        'TJ.Compliant':             'This Transformative Journal provides a route to compliance.',
    }
}




// -------- find_out_more --------

jct.get_fom_url = () => {
    let url = jct.host;
    url += "/";

    let jid, fid, iid, not_he = false;
    try {
        jid = jct.chosen.journal.id;
    } catch {}
    try {
        fid = jct.chosen.funder.id;
    } catch {}
    try {
        iid = jct.chosen.institution.id;
    } catch {}
    try {
        not_he = jct.d.gebi('jct_notHE').checked;
    } catch {}

    let args = [];
    if (jid) {
        args.push("issn=" + jid);
    }
    if (fid) {
        args.push("funder=" + fid);
    }
    if (iid) {
        args.push("ror=" + iid);
    }
    if (not_he) {
        args.push("not_he=" + not_he);
    }

    if (args.length > 0) {
        let query = args.join("&");
        url += "?" + query;
    }
    return url;
}

jct.setup_fom_url = () => {
    let fom = jct.d.gebi("jct_find_out_more");
    if (fom) {
        let url = jct.get_fom_url();
        fom.setAttribute("href", url);
    }
}

jct.display_results_url = () => {
    let fom = jct.d.gebi("jct_results_url");
    if (fom) {
        let url = jct.get_fom_url();
        fom.innerText = url;
    }
}

jct.copy_results_url = () => {
    let share_url = jct.d.gebi("jct_results_url");
    if (share_url) {
        navigator.clipboard.writeText(share_url.innerText)
    }
}



// -------- feedback --------

jct.setup_feedback_modal = () => {
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




// -------- plugin --------


// ----------------------------------------
// Function to add plugin containers
// ----------------------------------------
jct.add_plugin_containers = () => {
    // ----------------------------------------
    // html for holding the query
    // ----------------------------------------
    let query_container_html = `
        <div class="query" id="jct_query">
            <div class="header-logo">
                <h2 class="label">
                    <svg width="13" height="20" viewbox="0 0 13 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.28479 2.14158C5.43898 2.14158 4.62781 2.47934 4.02973 3.08057C3.43165 3.6818 3.09564 4.49725 3.09564 5.34752V6.07785H0.965235V5.34752C0.965235 3.92928 1.52568 2.56912 2.52329 1.56626C3.5209 0.563403 4.87395 0 6.28479 0C7.69562 0 9.04868 0.563403 10.0463 1.56626C11.0439 2.56912 11.6043 3.92928 11.6043 5.34752V10.3707C12.2009 11.3357 12.5455 12.4746 12.5455 13.6944C12.5455 17.1769 9.73706 20 6.27273 20C2.8084 20 0 17.1769 0 13.6944C0 10.2119 2.8084 7.38877 6.27273 7.38877C7.44213 7.38877 8.5368 7.71045 9.47393 8.27058V5.34752C9.47393 4.49725 9.13793 3.6818 8.53984 3.08057C7.94176 2.47934 7.13059 2.14158 6.28479 2.14158ZM6.27273 9.53034C3.98499 9.53034 2.13041 11.3946 2.13041 13.6944C2.13041 15.9941 3.98499 17.8584 6.27273 17.8584C8.56047 17.8584 10.415 15.9941 10.415 13.6944C10.415 11.3946 8.56047 9.53034 6.27273 9.53034Z" fill="#F47115"></path>
                        <path d="M6.29321 15.4802C7.26388 15.4802 8.05077 14.6892 8.05077 13.7134C8.05077 12.7376 7.26388 11.9466 6.29321 11.9466C5.32254 11.9466 4.53566 12.7376 4.53566 13.7134C4.53566 14.6892 5.32254 15.4802 6.29321 15.4802Z" fill="#F47115"></path>
                    </svg>
                    <a href="https://journalcheckertool.org">cOAlition S: Journal Checker Tool</a>
                </h2>
            </div>
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
            <div class="row">
                <div class="col col--1of2 col--centered">
                    <a href="#" class="button button--secondary" id="jct_find_out_more" target="_blank">Find out more</a>
                </div>
                <div class="col col--2of2 col--centered">
                    <button class="button button--primary" id="jct_restart">
                        <svg width="30" height="25" viewBox="0 0 30 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.57592 9.07816L2.94589 10.4481C3.92217 4.80549 8.85311 0.5 14.7704 0.5C18.2125 0.5 21.4922 1.98062 23.7704 4.56246C24.1073 4.94462 24.0713 5.528 23.6891 5.86585C23.3079 6.20277 22.7245 6.16677 22.3857 5.78462C20.4584 3.59877 17.6817 2.34615 14.7704 2.34615C9.70014 2.34615 5.48545 6.08244 4.73523 10.9461L6.97131 9.8277C7.42823 9.5997 7.98208 9.78431 8.21008 10.2403C8.43808 10.6963 8.25346 11.2511 7.79746 11.4791L4.14234 13.3066C4.01456 13.3779 3.86813 13.4198 3.71225 13.4229L3.69346 13.4231C3.59256 13.4231 3.49231 13.4066 3.39684 13.3743C3.26521 13.3298 3.14264 13.2553 3.03992 13.1526L0.270692 10.3834C-0.0902308 10.0225 -0.0902308 9.43908 0.270692 9.07816C0.631615 8.71724 1.215 8.71724 1.57592 9.07816ZM5.77034 20.4385C8.04942 23.0194 11.3291 24.5 14.7703 24.5C20.6873 24.5 25.6181 20.1949 26.5947 14.5526L27.964 15.9218C28.144 16.1018 28.3803 16.1923 28.6166 16.1923C28.8529 16.1923 29.0892 16.1018 29.2692 15.9228C29.6301 15.5618 29.6301 14.9785 29.2692 14.6175L26.5271 11.8754C26.3584 11.6919 26.1165 11.5769 25.8473 11.5769C25.6855 11.5769 25.5336 11.6185 25.4015 11.6914L21.7424 13.5209C21.2864 13.7489 21.1018 14.3037 21.3298 14.7597C21.5587 15.2157 22.1135 15.3985 22.5686 15.1723L24.8055 14.0535C24.0555 18.9173 19.8407 22.6538 14.7703 22.6538C11.859 22.6538 9.08326 21.4012 7.15403 19.2163C6.81711 18.8351 6.23372 18.7972 5.85157 19.1351C5.46942 19.472 5.43249 20.0563 5.77034 20.4385Z" fill="#2B2B2B"/>
                        </svg>Start over
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
    jct.setup(false);
    jct.set_defaults();
}


