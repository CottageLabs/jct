
// -------- i_am_a_widget --------

window.JCT_WIDGET = true;



// -------- api_endpoint --------

window.JCT_API_endpoint = 'https://api.jct.cottagelabs.com';
window.JCT_UI_BASE_URL = "https://jct.cottagelabs.com";



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
        this.selectedObjectToSearchString = params.selectedObjectToSearchString || false
        // this.lastSearchValue = "";
        this.setLastSearchValue("");
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
        input.addEventListener("blur", () => {this.recordSearchValue(true)});
        input.addEventListener("keydown", (e) => {
            let entries = document.getElementsByClassName("clinput__option_"+this.id);
            let arrowPress = (code, entries) => {
                if(code === "ArrowDown"){
                    entries[0].focus();
                    e.preventDefault();
                }
            }
            if (entries.length > 0) {
                this._dispatchForCode(event, arrowPress, entries);
            }
        });
    }

    activate() {
        let input = document.getElementById(this.id);
        input.focus();
    }

    setChoice(value, callback) {
        this.value = value;
        this.options_method(value, (data) => {
            this.optionsReceived(data, true)
            if (this.options.length > 0) {
                this.selectedObject = this.options[0];
                this.showSelectedObject();
            }
            callback(this.selectedObject);
        });
    }

    hasChoice() {
        return !!this.selectedObject;
    }

    unsetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    setLastSearchValue(val) {
        this.lastSearchValue = val;
    }

    recordSearchValue(root) {
        let input = document.getElementById(this.id);
        let newVal = input.value;
        if (newVal !== this.lastSearchValue) {
            // this.lastSearchValue = input.value;
            this.setLastSearchValue(input.value);
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
        // this.lastSearchValue = "";
        this.setLastSearchValue("");
    }

    activateInput() {
        let input = document.getElementById(this.id);
        this._setInputValue(this.lastSearchValue);
        this.value = "";

        if (this.selectedObject) {
            let lsv = this.lastSearchValue.toLowerCase();
            let keys = Object.keys(this.selectedObject);

            if (lsv) {
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
            } else {
                if (this.selectedObjectToSearchString) {
                    let ss = this.selectedObjectToSearchString(this.selectedObject);
                    this._setInputValue(ss);
                } else {
                    this._setInputValue(this.selectedObject[keys[0]])
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
        // this.lastSearchValue = input.value;
        this.setLastSearchValue(input.value);
        this.selectedObject = this.options[idx];
        this.showSelectedObject();
        // input.blur();
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


// -------- default_lang --------

var JCT_LANG={"icons": {"fully_oa": "<span class=\"card__icon\"> <svg width=\"16\" height=\"22\" viewBox=\"0 0 16 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M2.75 4.8125V8.9375H1.71531C0.769312 8.9375 0 9.70681 0 10.6528V20.2806C0 21.2286 0.771375 22 1.71875 22H13.4056C14.3536 22 15.125 21.2286 15.125 20.2806V10.6528C15.125 9.70681 14.3557 8.9375 13.4097 8.9375H4.125V4.8125C4.125 2.91706 5.66706 1.375 7.5625 1.375C9.45794 1.375 11 2.91706 11 4.8125V6.1875C11 6.567 11.3073 6.875 11.6875 6.875C12.0677 6.875 12.375 6.567 12.375 6.1875V4.8125C12.375 2.15875 10.2156 0 7.5625 0C4.90875 0 2.75 2.15875 2.75 4.8125ZM1.71531 10.3125C1.52762 10.3125 1.375 10.4651 1.375 10.6528V20.2806C1.375 20.4703 1.52969 20.625 1.71875 20.625H13.4056C13.5953 20.625 13.75 20.4703 13.75 20.2806V10.6528C13.75 10.4651 13.5974 10.3125 13.4097 10.3125H1.71531ZM6.875 17.1875C6.875 17.5677 7.183 17.875 7.5625 17.875C7.942 17.875 8.25 17.5677 8.25 17.1875V13.75C8.25 13.3698 7.942 13.0625 7.5625 13.0625C7.183 13.0625 6.875 13.3698 6.875 13.75V17.1875Z\" fill=\"black\"></path> </svg> </span>", "tj": "<span class=\"card__icon\"> <svg width=\"22\" height=\"22\" viewbox=\"0 0 22 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M10.3125 21.3125C10.3125 21.6927 10.6205 22 11 22C11.3795 22 11.6875 21.6927 11.6875 21.3125V0.6875C11.6875 0.308 11.3795 0 11 0C10.6205 0 10.3125 0.308 10.3125 0.6875V21.3125ZM8.25 19.25H1.71737C0.770687 19.25 0 18.4793 0 17.5326V4.455C0 3.51519 0.765188 2.75 1.705 2.75H8.18744C8.56694 2.75 8.87494 3.058 8.87494 3.4375C8.87494 3.817 8.56694 4.125 8.18744 4.125H1.705C1.52281 4.125 1.375 4.27281 1.375 4.455V17.5319C1.375 17.7176 1.53175 17.875 1.71737 17.875H8.25C8.6295 17.875 8.9375 18.1823 8.9375 18.5625C8.9375 18.9427 8.6295 19.25 8.25 19.25ZM19.3118 18.5625C19.3118 18.1844 19.6211 17.875 19.9993 17.875C20.3774 17.875 20.6868 18.1844 20.6868 18.5625C20.6868 18.9406 20.3774 19.25 19.9993 19.25C19.6211 19.25 19.3118 18.9406 19.3118 18.5625ZM17.2493 18.5625C17.2493 18.1844 17.5586 17.875 17.9368 17.875C18.3149 17.875 18.6243 18.1844 18.6243 18.5625C18.6243 18.9406 18.3149 19.25 17.9368 19.25C17.5586 19.25 17.2493 18.9406 17.2493 18.5625ZM15.1868 18.5625C15.1868 18.1844 15.4961 17.875 15.8743 17.875C16.2524 17.875 16.5618 18.1844 16.5618 18.5625C16.5618 18.9406 16.2524 19.25 15.8743 19.25C15.4961 19.25 15.1868 18.9406 15.1868 18.5625ZM13.1243 18.5625C13.1243 18.1844 13.4336 17.875 13.8118 17.875C14.1899 17.875 14.4993 18.1844 14.4993 18.5625C14.4993 18.9406 14.1899 19.25 13.8118 19.25C13.4336 19.25 13.1243 18.9406 13.1243 18.5625ZM20.6249 17.3731C20.6249 16.995 20.9343 16.6856 21.3124 16.6856C21.6905 16.6856 21.9999 16.995 21.9999 17.3731C21.9999 17.7588 21.6905 18.0606 21.3124 18.0606C20.9343 18.0606 20.6249 17.7581 20.6249 17.3731ZM20.6249 15.3106C20.6249 14.9325 20.9343 14.6231 21.3124 14.6231C21.6905 14.6231 21.9999 14.9325 21.9999 15.3106C21.9999 15.6963 21.6905 15.9981 21.3124 15.9981C20.9343 15.9981 20.6249 15.6956 20.6249 15.3106ZM20.6249 13.2481C20.6249 12.87 20.9343 12.5606 21.3124 12.5606C21.6905 12.5606 21.9999 12.87 21.9999 13.2481C21.9999 13.6338 21.6905 13.9356 21.3124 13.9356C20.9343 13.9356 20.6249 13.6331 20.6249 13.2481ZM20.6249 11.1925C20.6249 10.8075 20.9343 10.4981 21.3124 10.4981C21.6905 10.4981 21.9999 10.8075 21.9999 11.1925C21.9999 11.5706 21.6905 11.8731 21.3124 11.8731C20.9343 11.8731 20.6249 11.5706 20.6249 11.1925ZM20.6249 9.12313C20.6249 8.745 20.9343 8.4425 21.3124 8.4425C21.6905 8.4425 21.9999 8.745 21.9999 9.12313C21.9999 9.50813 21.6905 9.8175 21.3124 9.8175C20.9343 9.8175 20.6249 9.50813 20.6249 9.12313ZM20.6249 7.0675C20.6249 6.6825 20.9343 6.37313 21.3124 6.37313C21.6905 6.37313 21.9999 6.6825 21.9999 7.0675C21.9999 7.44562 21.6905 7.74813 21.3124 7.74813C20.9343 7.74813 20.6249 7.44562 20.6249 7.0675ZM20.6249 4.99813C20.6249 4.62 20.9343 4.3175 21.3124 4.3175C21.6905 4.3175 21.9999 4.62 21.9999 4.99813C21.9999 5.38312 21.6905 5.6925 21.3124 5.6925C20.9343 5.6925 20.6249 5.38312 20.6249 4.99813ZM20.3155 4.125H20.3086C19.9305 4.09062 19.6555 3.76063 19.683 3.3825C19.7174 3.00437 20.0474 2.7225 20.4324 2.75688H20.4255C20.8036 2.79125 21.0855 3.12125 21.058 3.49938C21.0236 3.85688 20.728 4.13188 20.3705 4.13188C20.359 4.13188 20.3473 4.12974 20.337 4.12785C20.3287 4.12635 20.3213 4.125 20.3155 4.125ZM17.6205 3.4375C17.6205 3.05938 17.9299 2.75 18.308 2.75C18.6861 2.75 18.9955 3.05938 18.9955 3.4375C18.9955 3.81562 18.6861 4.125 18.308 4.125C17.9299 4.125 17.6205 3.81562 17.6205 3.4375ZM15.558 3.4375C15.558 3.05938 15.8674 2.75 16.2455 2.75C16.6236 2.75 16.933 3.05938 16.933 3.4375C16.933 3.81562 16.6236 4.125 16.2455 4.125C15.8674 4.125 15.558 3.81562 15.558 3.4375ZM13.4955 3.4375C13.4955 3.05938 13.8049 2.75 14.183 2.75C14.5611 2.75 14.8705 3.05938 14.8705 3.4375C14.8705 3.81562 14.5611 4.125 14.183 4.125C13.8049 4.125 13.4955 3.81562 13.4955 3.4375Z\" fill=\"black\"> </path> </svg> </span>", "self_archiving": "<span class=\"card__icon\"> <svg width=\"22\" height=\"22\" viewbox=\"0 0 22 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M22 5.15831C22 5.98803 21.4085 6.68203 20.625 6.84086V20.2778C20.625 21.2273 19.8523 22 18.9028 22H3.09719C2.14775 22 1.375 21.2273 1.375 20.2778V6.84086C0.591483 6.68203 0 5.98803 0 5.15831V1.71669C0 0.77 0.77 0 1.71669 0H20.2833C21.23 0 22 0.77 22 1.71669V5.15831ZM20.2833 5.5H19.9375H2.0625H1.71669C1.52831 5.5 1.375 5.34669 1.375 5.15831V1.71669C1.375 1.52831 1.52831 1.375 1.71669 1.375H20.2833C20.4717 1.375 20.625 1.52831 20.625 1.71669V5.15831C20.625 5.34669 20.4717 5.5 20.2833 5.5ZM2.75 20.2778V6.875H19.25V20.2778C19.25 20.4689 19.0939 20.625 18.9028 20.625H3.09719C2.90606 20.625 2.75 20.4689 2.75 20.2778ZM7.5625 11H14.4375C14.8177 11 15.125 10.692 15.125 10.3125C15.125 9.933 14.8177 9.625 14.4375 9.625H7.5625C7.183 9.625 6.875 9.933 6.875 10.3125C6.875 10.692 7.183 11 7.5625 11Z\" fill=\"black\"> </path> </svg> </span>", "ta": "<span class=\"card__icon\"> <svg width=\"22\" height=\"22\" viewbox=\"0 0 22 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M0 4.8125C0 5.192 0.308 5.5 0.6875 5.5H4.125V17.1875V19.25C4.125 20.7666 5.35838 22 6.875 22H19.25C20.7666 22 22 20.7666 22 19.25V17.1875C22 16.8073 21.6927 16.5 21.3125 16.5H19.25V2.75C19.25 1.23337 18.0166 0 16.5 0H2.75C1.23337 0 0 1.23337 0 2.75V4.8125ZM17.875 2.75C17.875 1.99169 17.2583 1.375 16.5 1.375H5.13107C5.36564 1.7797 5.5 2.24942 5.5 2.75V4.8125V17.1875V19.25C5.5 20.0083 6.11669 20.625 6.875 20.625C7.63331 20.625 8.25 20.0083 8.25 19.25V17.1875C8.25 16.8073 8.558 16.5 8.9375 16.5H17.875V2.75ZM9.625 17.875H18.5625H20.625V19.25C20.625 20.0083 20.0083 20.625 19.25 20.625H9.25607C9.49064 20.2203 9.625 19.7506 9.625 19.25V17.875ZM1.375 2.75C1.375 1.99169 1.99169 1.375 2.75 1.375C3.50831 1.375 4.125 1.99169 4.125 2.75V4.125H1.375V2.75ZM15.8125 5.5H7.5625C7.183 5.5 6.875 5.192 6.875 4.8125C6.875 4.433 7.183 4.125 7.5625 4.125H15.8125C16.1927 4.125 16.5 4.433 16.5 4.8125C16.5 5.192 16.1927 5.5 15.8125 5.5ZM7.5625 8.25H15.8125C16.1927 8.25 16.5 7.942 16.5 7.5625C16.5 7.183 16.1927 6.875 15.8125 6.875H7.5625C7.183 6.875 6.875 7.183 6.875 7.5625C6.875 7.942 7.183 8.25 7.5625 8.25ZM15.8125 11H7.5625C7.183 11 6.875 10.692 6.875 10.3125C6.875 9.933 7.183 9.625 7.5625 9.625H15.8125C16.1927 9.625 16.5 9.933 16.5 10.3125C16.5 10.692 16.1927 11 15.8125 11ZM7.5625 13.75H11.6875C12.0677 13.75 12.375 13.4427 12.375 13.0625C12.375 12.6823 12.0677 12.375 11.6875 12.375H7.5625C7.183 12.375 6.875 12.6823 6.875 13.0625C6.875 13.4427 7.183 13.75 7.5625 13.75Z\" fill=\"black\"> </path> </svg> </span>"}, "explain": {"supporting_data": {"non_compliant_routes": "Non-Compliant Routes", "qualifications_prefix": "Please note, ", "title": "Data Supporting your Ways to Comply", "compliant_routes": "Compliant Routes", "text": "This section tells you about the routes that support your ways to compliance", "unknown_routes": "Unknown Routes"}, "versions": {"publishedVersion": "Published version", "submittedVersion": "Submitted version", "acceptedVersion": "Accepted version"}, "qualification_match": {"not": "None of the following qualifications must be present", "or": "At least one of the following qualifications must be present", "must": "The following qualifications must be present"}, "ways_to_comply": {"text": "This section tells you about your ways to comply", "how_it_complies": {"text": "this is how this combination meets those conditions", "title": "How this way is compliant"}, "conditions": {"text": "these are the conditions that this way to comply specifies", "title": "Conditions to meet"}, "advice": {"text": "", "title": "Advice for authors"}, "title": "Ways to Comply"}, "route_match": {"not": "None of the following routes must be compliant", "or": "At least one of the following routes must be compliant", "must": "The following routes must all be compliant"}, "your_query": {"institution_label": "Institution", "unaffiliated": "Not part of Higher Education", "title": "Your query", "text": "You asked us to calculate whether you can comply with Plan S under the following conditions:", "publisher_label": "Publisher", "journal_title_unknown": "Unknown Title", "statement": "We carried out this query at {date}, and found {compliant} route{compliant_plural} that enable compliance, {non_compliant} non-compliant route{non_compliant_plural} and {unknown} undetermined route{unknown_plural}.", "publisher_not_known": "Not known", "funder_label": "Funder", "journal_label": "Journal"}, "routes": {"hybrid": {"label": "Hybrid Route"}, "fully_oa": {"unknown": {"explanation": "The following checks in the Directory of Open Access Journals (DOAJ) were carried out to determine compliance:", "statement": "We are <b>unable to determine if you are complaint</b> via the fully open access journal route."}, "yes": {"explanation": "The following checks in the Directory of Open Access Journals (DOAJ) were carried out to determine if your chosen journal is an open access journal that enables compliance:", "statement": "You are able to comply with Plan S as this is a fully open access journal."}, "no": {"explanation": "The following checks in the Directory of Open Access Journals (DOAJ) were carried out to determine that this is not a route to compliance:", "statement": "You are not able to <b>comply with Plan S</b> via the fully open access journal route."}, "label": "Open Access Journal Route"}, "tj": {"unknown": {"explanation": "The following checks were carried out on the JCT's Transformative Journal Index to determine compliance:", "statement": "We are unable to determine if this journal is a Transformative Journal and therefore <b>unable to determine compliance</b> via this route."}, "yes": {"explanation": "The following checks were carried out on the JCT's Transformative Journal Index to determine that this is a compliant route:", "statement": "This journal is a Transformative Journal and therefore you <b>can comply with Plan S</b> via this route."}, "no": {"explanation": "The following checks were carried out on the JCT's Transformative Journal Index to determine that this is not a compliant route:", "statement": "This journal is not a Transformative Journal and therefore you <b>cannot comply with Plan S</b> via this route."}, "label": "Transformative Journal Route"}, "self_archiving": {"unknown": {"explanation": "The following checks were carried out to determine compliance:", "statement": "We are <b>unable to determine</b> if you are able to comply with Plan S via Self-archiving, when publishing in this journal."}, "yes": {"explanation": "The following checks were carried out to determine whether the right exists to comply with Plan S via self-archiving. Data from Open Access Button Permissions (OAB Permissions) is used to see if the publisher's policy of self-archiving enables compliance. If it does not or if an unknown answer has been returned then the cOAlition S Implementation Roadmap data is checked to see if cOAlition S's Rights Retention Strategy provides a route to compliance:", "statement": "You are able to comply with Plan S via Self-archiving."}, "no": {"explanation": "The following checks were carried out to determine that this is not a compliant route:", "statement": "Self-archiving does not enable <b>Plan S</b> compliance when publishing in this journal."}, "label": "Self Archiving Route"}, "ta": {"unknown": {"explanation": "The following checks were carried out on the JCT's Transformative Agreement Index to determine compliance:", "statement": "We are <b>unable to determine</b> if you are able to comply with Plan S via a Transformative Agreement."}, "yes": {"explanation": "The following checks were carried out on the JCT's Transformative Agreement Index to determine if a Transformative Agreement is available that would enable compliance:", "statement": "You are able to comply with Plan S via a Transformative Agreement."}, "no": {"explanation": "The following checks were carried out on the JCT's Transformative Agreement Index to determine if a Transformative Agreement is available that would enable compliance:", "statement": "You are not able to <b>comply with Plan S</b> via a Transformative Agreement."}, "label": "Transformative Agreement Route"}}}, "modals": {"preferred": {"body": "<p>The Version of Record (VoR) is different from the Author Accepted Manuscript (AAM). The AAM is the version accepted for publication, including all changes made during peer review. The VoR contains all the changes from the copyediting process, journal formatting/branding etc., but it is also the version maintained and curated by the publisher, who has the responsibility to ensure that any corrections or retractions are applied in a timely and consistent way.</p> <p>For these reasons, the preferred option is to ensure that the VoR is made Open Access. Where the VoR can be made available in accordance with the Plan S principles, and there is a cost, many cOAlition S Organisations make funding available to cover these costs.</p>", "title": "Preferred Route to OA"}, "plan_s": {"body": "<p>Plan S aims for full and immediate Open Access to peer-reviewed scholarly publications from research funded by public and private grants. <a href=\"https://www.coalition-s.org/\" target=\"_blank\" rel=\"noopener\">cOAlition S</a> is the coalition of research funding and performing organisations that have committed to implementing Plan S. The goal of cOAlition S is to accelerate the transition to a scholarly publishing system that is characterised by immediate, free online access to, and largely unrestricted use and re-use (full Open Access) of scholarly publications. </p> <p>The Journal Checker Tool enables researchers to check whether they can comply with their funders Plan S aligned OA policy based on the combination of journal, funder(s) and the institution(s) affiliated with the research to be published. The tool currently only identifies routes to open access compliance for Plan S aligned policies.</p> <p>This is a <a href=\"https://www.coalition-s.org/\" target=\"_blank\" rel=\"noopener\">cOAlition S</a> project.</p> <p> <a href=\"/notices#privacy_notice\">Privacy Notice</a> \u2022 <a href=\"/notices#disclaimer_and_copyright\">Disclaimer & Copyright</a> </p>", "title": "What's this?"}, "sa_rr": {"body": "<p>The cOAlition S <a href=\"https://www.coalition-s.org/wp-content/uploads/2020/10/RRS_onepager.pdf\" target=\"_blank\" rel=\"noopener\">Rights Retention Strategy</a> sets out how you can retain sufficient rights to self-archive your Author Accepted Manuscript in any OA repository at the time of publication with a CC BY license. When using this route to make your research articles OA, no fees are payable to the publisher.</p> <p>Some subscription publishers may impose conditions -- via the License to Publish Agreement or otherwise -- that prevent you from meeting your funders' OA requirements. Authors should check publication terms before submitting a manuscript and should not sign a publishing contract that conflicts with funder conditions. Contact your funder for more information and guidance.</p>", "title": "Compliance through self-archiving using rights retention"}, "tj": {"body": "<p>A <em>Transformative Journal</em> is a subscription/hybrid journal that is committed to transitioning to a fully OA journal. It must gradually increase the share of OA content and offset subscription income from payments for publishing services (to avoid double payments).</p> <p>Check <a href=\"https://www.coalition-s.org/plan-s-funders-implementation/\" target=\"_blank\" rel=\"noopener\">here</a> to confirm if your funder will pay publishing fees.</p>", "title": "Transformative journals"}, "sa": {"body": "<p>Self-archiving is sometimes referred to as <em>green open access</em>. Publishing fees do not apply with this route.</p> <p>Publish your article via the journal\u2019s standard route and do not select an open access option. Following acceptance, deposit the full text version of the author accepted manuscript (the version that includes changes requested by peer-reviewers) to a repository without embargo and under a <a href=\"https://creativecommons.org/licenses/by/2.0/\" target=\"_blank\" rel=\"noopener\">CC BY licence</a>. Your funder may require you to archive your article in a specific repository.</p>", "title": "Self-archiving"}, "ta": {"body": "<p>Consult your institution\u2019s library prior to submitting to this journal. </p> <p><em>Transformative agreements</em> may have eligibility criteria or limits on publication numbers in place that the Journal Checker Tool is currently not able to check. </p>", "title": "Transformative agreements"}}, "site": {"card_modal": "More information", "card_institution_missing": "No institution specified", "compliant": "The following publishing options are aligned with your funder\u2019s OA policy.", "non_compliant": "There are no publishing options aligned with your funder\u2019s OA policy.", "preferred": "<a href=\"#\" class=\"modal-trigger\" data-modal=\"preferred\">Preferred</a>"}, "api_codes": {"qualifications": {"rights_retention_author_advice": {"description": "your funder supports you to use the <a href=\"https://www.coalition-s.org/faq-theme/rights-licences/\" target=\"_blank\"  rel=\"noopener\"> cOAlition S rights retention strategy</a> as a route to compliance irrespective of the journal's self-archiving policy."}, "journal": {"description": "a transformative agreement is currently in force for this journal.", "end_date": "End date of the transformative agreement:", "start_date": "Start date of the transformative agreement:"}, "doaj_under_review": {"description": "this journal is currently under review for potential inclusion in DOAJ, it is yet to be approved for inclusion within the public DOAJ database."}, "institution": {"description": "a transformative agreement is currently in force for this institution.", "end_date": "End date of the transformative agreement:", "start_date": "Start date of the transformative agreement:"}, "corresponding_authors": {"description": "the corresponding author of the submitted article must be based at an institution within this transformative agreement for it to provide a route to compliance."}}, "logs": {"fully_oa": {"FullOA.Unknown.Properties": {"missing": "The following required information was missing from the DOAJ record:"}, "FullOA.NonCompliant.Properties": {"licence": "The licences allowed by this journal are:"}, "FullOA.NonCompliant": "This journal does not enable you to publish under a CC BY or equivalent licence required for policy compliance.", "FullOA.NotInDOAJ": "This journal is not present in DOAJ.", "FullOA.Compliant": "This journal enables you to publish under the following licences that are supported by your funder's policy:", "FullOA.Compliant.Properties": {"licence": ""}, "FullOA.InDOAJ": "This journal is present in DOAJ.", "FullOA.InProgressDOAJ": "This journal is currently under review for potential inclusion in DOAJ.", "FullOA.NotInProgressDOAJ": "This journal is not currently under review at DOAJ.", "FullOA.Unknown": "We were unable to determine if this journal provides a route to compliance."}, "tj": {"TJ.NoTJ": "This journal is not a Transformative Journal.", "TJ.NonCompliant": "As this journal is not a Transformative Journal, this route to compliance is not available.", "TJ.Exists": "This journal is a Transformative Journal.", "TJ.Compliant": "This Transformative Journal provides a route to compliance."}, "self_archiving": {"SA.OABNonCompliant": "This journal's self-archiving policy does not enable compliance with your funder's open access policy, for the following reason(s):", "SA.OABIncomplete": "We were unable to determine if this journal provides a route to compliance.", "SA.Compliant": "Self-archiving can be a route to compliance when publishing in this journal.", "SA.OABCompliant.Properties": {"embargo": "There is an embargo period (in months):", "version": "The manuscript version that can be archived is:", "licence": "The licence that can be used on the manuscript to be archived is:"}, "SA.NonCompliant": "Self-archiving is not a route to compliance when publishing in this journal.", "SA.Unknown": "We are unable to determine if this journal provides a route to compliance via self-archiving due to missing information.", "SA.InOAB": "This journal is present in OAB Permissions.", "SA.OABNonCompliant.Properties": {"embargo": "There is an embargo period (in months):", "version": "The manuscript version that can be archived is:", "licence": "The licence that can be used on the manuscript to be archived is:"}, "SA.FunderRRNotActive": "Your funder has not implemented the <a href=\"https://www.coalition-s.org/faq-theme/rights-licences/\" target=\"_blank\"  rel=\"noopener\">Plan S Rights Retention Strategy</a>.", "SA.OABCompliant": "This journals self-archiving policy aligns with your funder's open access policy.", "SA.FunderRRActive": "Your funder has implemented the <a href=\"https://www.coalition-s.org/faq-theme/rights-licences/\" target=\"_blank\"  rel=\"noopener\">Plan S Rights Retention Strategy</a>. Rights retention takes precedence over the journal's self-archiving policy. It provides a route to compliance irrespective of publisher imposed restrictions or embargo periods.", "SA.NotInOAB": "This journal is not present in OAB Permissions.", "SA.OABIncomplete.Properties": {"missing": "The following required information was missing from the OAB Permissions database:"}}, "ta": {"TA.Exists": "A Transformative Agreement containing the selected journal and institution was found within our database.", "TA.Compliant": "A Transformative Agreement is available that can provide a route to compliance.", "TA.NotActive": "Our database shows that the Transformative Agreement containing the selected journal and institution has expired.", "TA.Active": "Our database shows that the Transformative Agreement containing the selected journal and institution is active.", "TA.Unknown": "We do not have sufficient information to determine if a Transformative Agreement is available to provide a route to compliance.", "TA.NoTA": "No Transformative Agreement containing the selected journal and institution was found within our database.", "TA.NonCompliant": "There is no Transformative Agreement available to provide a route to compliance."}}}, "cards": {"self_archiving": {"body": {"default": "<p>Upon acceptance, you can deposit your Author Accepted Manuscript in a repository without embargo and with a <a href=\"https://creativecommons.org/licenses/by/2.0/\" target=\"_blank\" rel=\"noopener\"> CC BY licence</a>. Publishing fees do not apply with this route. </p>"}, "title": "Self-archiving", "icon": "self_archiving"}, "rights_retention_non_compliant": {"body": {"default": "<p>cOAlition S has developed a Rights Retention Strategy to give researchers supported by a cOAlition S Funder the freedom to publish in their journal of choice, including subscription journals, whilst remaining fully compliant with Plan S. <a href=\"https://www.coalition-s.org/wp-content/uploads/2020/10/RRS_onepager.pdf\" target=\"_blank\" rel=\"noopener\">More information on how to use it is available here</a>.</p>"}, "title": "Rights retention", "icon": "false"}, "institution_non_compliant": {"body": {"default": "<p>If you or other authors on your research article are affiliated with different institutions, repeat your search with these alternative institutions. Transformative agreements, are made between publishers and (consortia of) institutions. While the institution you searched does not currently have an agreement with the publisher of this journal, one of your collaborator\u2019s institutions may do.</p>"}, "title": "Check with a different institution", "icon": "false"}, "sa_rr": {"body": {"default": "<p>Your funder\u2019s grant conditions set out how you can retain sufficient rights to self-archive the Author Accepted Manuscript in any OA repository. Publishing fees do not apply with this route.</p>"}, "title": "Compliance through self-archiving using rights retention", "icon": "self_archiving"}, "fully_oa": {"body": {"default": "<p>Go ahead and submit. Remember to select a <a href=\"https://creativecommons.org/licenses/by/2.0/\" target=\"_blank\" rel=\"noopener\"> CC BY licence</a> to ensure compliance.</p> <p>Upon publication, you have the right to self-archive the final published article as an additional route to compliance rather than an alternative route. </p>"}, "title": "Full <br>Open Access", "icon": "fully_oa"}, "tj": {"body": {"default": "<p>Go ahead and submit. Remember to select the open access publishing option with a <a href=\"https://creativecommons.org/licenses/by/2.0/\" target=\"_blank\" rel=\"noopener\"> CC BY licence</a> to ensure compliance.</p> <p>Check <a href=\"https://www.coalition-s.org/plan-s-funders-implementation/\" target=\"_blank\" rel=\"noopener\">here</a> to confirm if your funder will pay publishing fees.</p>"}, "title": "Transformative <br>journal", "icon": "tj"}, "journal_non_compliant": {"body": {"default": "<p>Repeat your search with an alternative journals to see if it provides a route to compliance with your funder\u2019s Plan S aligned open access policy.</p>"}, "title": "Check with an alternative journal", "icon": "false"}, "ta": {"body": {"default": "<p>Conditions may be in place around publishing through this agreement. <a href=\"#\" class=\"modal-trigger\" data-modal=\"ta\">Make sure to read this information</a>.</p> <p><em>{title}</em> is part of a transformative agreement between <em>{publisher}</em> and <em>{institution}</em></p>"}, "title": "Transformative <br>agreement", "icon": "ta"}, "funder_non_compliant": {"body": {"default": "<p>If your research was funded by multiple Plan S funders, repeat your search using the name of one of the other funders. The implementation timeline for Plan S aligned open access policies is not the same for all funders, therefore results may vary by funder.</p>"}, "title": "Check with a different funder", "icon": "false"}, "ta_aq": {"body": {"default": "<p>The corresponding author of the submitted article must be based at an institution within this transformative agreement for it to provide a route to compliance</p> <p>Other conditions may also be in place around publishing through this agreement.</p> <p><a href=\"#\" class=\"modal-trigger\" data-modal=\"ta_modal\">Make sure to read this information</a>.</p> <p><em>{title}</em> is part of a transformative agreement between <em>{publisher}</em> and <em>{institution}</em></p>"}, "title": "Transformative <br>agreement", "icon": "ta"}}}


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
    latest_response: null,
    lang: JCT_LANG,
    modal_setup : {},
    clinputs: {},
    inputsCycle: {
        "journal" : "funder",
        "funder" : "institution"
    }
};

jct.d = document;
jct.d.gebi = document.getElementById;
jct.d.gebc = document.getElementsByClassName;

////////////////////////////////////////////////////////
// HTML Fragments for Application structure

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

/////////////////////////////////////////////////////////
// Cards and card management

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
}

// ----------------------------------------
// Function to display specific card
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

    if (choices.institution) {
        body = body.replace("{institution}", choices.institution.title);
    } else {
        body = body.replace("{institution}", uiText.site.card_institution_missing);
    }

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

////////////////////////////////////////////////
// Modal handling

jct.bindModals = function() {
    let triggers = document.getElementsByClassName("modal-trigger");
    for (let i = 0; i < triggers.length; i++) {
        let trigger = triggers[i];
        trigger.removeEventListener("click", jct.modalTrigger);
        trigger.addEventListener("click", jct.modalTrigger)
    }
}

jct.modalTrigger = function(event) {
    event.preventDefault();
    let element = event.target;
    let modalId = element.getAttribute("data-modal");
    let modal = jct.build_modal(modalId);
    jct.modalShow(modal);
    if (jct.modal_setup.hasOwnProperty(modalId)) {
        jct.modal_setup[modalId]();
    }
}

jct.modalShow = function(content) {
    let modal_div = jct.d.gebi("jct_modal_container");
    modal_div.innerHTML = content;

    let closers = document.getElementsByClassName("jct_modal_close");
    for (let i = 0; i < closers.length; i++) {
        closers[i].addEventListener("click", (e) => {
            jct.closeModal();
        });
    }

    window.addEventListener("click", jct._windowCloseModal)
}

jct.closeModal = function() {
    let modal_div = jct.d.gebi("jct_modal_container");
    modal_div.innerText = "";
    window.removeEventListener("click", jct._windowCloseModal)
}

jct._windowCloseModal = function(e) {
    let modals = [].slice.call(jct.d.gebc("modal"));
    if (modals.includes(e.target)){
        jct.closeModal();
    }
}

jct.build_modal = (modal_id) => {
    let modalText = jct.lang.modals[modal_id];
    if (!modalText) {
        return "";
    }
    let modal_html = `<div class="modal" id="jct_modal_${modal_id}" style="display: block">
        <div class="modal-content" id="jct_modal_${modal_id}_content">
            <header class="modal-header">
                <h2>${modalText.title}
                    <span class="close jct_modal_close" aria-label="Close" role="button" data-id="jct_modal_${modal_id}">&times;</span>
                </h2>
            </header>
            <div>${modalText.body}</div>
        </div>
    </div>`
    return modal_html;
}

//////////////////////////////////////////////
// Funder autocomplete

jct.indexFunders = function() {
    for (let i = 0; i < jct.funderlist.length; i++) {
        let funder = jct.funderlist[i];
        let tokens = []
        tokens = tokens.concat(jct.tokenise(funder.country));
        tokens = tokens.concat(jct.tokenise(funder.name));
        tokens = tokens.concat(jct.tokenise(funder.abbr));
        jct.funderlist[i].tokens = tokens
    }
}

jct.tokenise = function(str) {
    if (!str) { return [] }
    return str.trim().split(" ").map(x => x.trim().toLowerCase())
}

jct.searchFunders = function(str) {
    let searchTokens = jct.tokenise(str);

    // find all matching records
    let matches = {};
    for (let j = 0; j < jct.funderlist.length; j++) {
        let funder = jct.funderlist[j];
        for (let i = 0; i < searchTokens.length; i++) {
            let st = searchTokens[i];
            // first check the search tokens
            for (let k = 0; k < funder.tokens.length; k++) {
                let ft = funder.tokens[k]
                let idx = ft.indexOf(st);
                if (idx > -1) {
                    let add = 1;
                    if (idx === 0) {
                        add = 2;
                    }
                    if (matches.hasOwnProperty(funder.id)) {
                        matches[funder.id].score += add;
                    } else {
                        matches[funder.id] = {"record" : funder, "score" : add}
                    }
                }
            }

            // then also check the funder id, which is a high scoring match
            if (st === funder.id) {
                if (matches.hasOwnProperty(funder.id)) {
                    matches[funder.id].score += 100;
                } else {
                    matches[funder.id] = {"record" : funder, "score" : 100}
                }
            }
        }
    }

    // sort the records by score
    let matchIds = Object.keys(matches);
    let matchRecords = []
    for (let i = 0; i < matchIds.length; i++) {
        let id = matchIds[i];
        matchRecords.push(matches[id]);
    }
    matchRecords.sort((a, b) => a.score < b.score ? 1 : -1);

    return matchRecords
}


////////////////////////////////////////////////
// Utilities

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
        for (const [key, value] of searchParams.entries()) {url.searchParams.append(key, value)}
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

///////////////////////////////////////////////////////
// Query lifecycle functions

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
    jct.bindModals();
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

///////////////////////////////////////////////////////
// Autosuggest input box management

// ----------------------------------------
// function to set focus on next element after choosing from auto suggestion and
// calculate if all data provided
// ----------------------------------------
jct.choose = (e, el, which) => {
    jct.chosen[which] = el;
    let next = jct.inputsCycle[which];
    if (next) {
        let inp = jct.clinputs[next];
        if (!inp.hasChoice()) {
            inp.activate();
        }
    }
    if (which === "institution") {
        jct.d.gebi('jct_notHE').checked = false;
    }
    // if (which === 'journal') {
    //     jct.d.gebi('jct_funder').focus();
    // } else if (which === 'funder') {
    //     jct.d.gebi('jct_institution').focus();
    // } else {
    //     jct.d.gebi('jct_institution').blur();
    //     jct.d.gebi('jct_notHE').checked = false;
    // }
    jct._calculate_if_all_data_provided();
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

//////////////////////////////////////////////////////////////
// Toggling detailed results

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

//////////////////////////////////////////////////////////
// Initialisation

// ----------------------------------------
// Setup JCT on a fresh page
// ----------------------------------------
jct.setup = (manageUrl=true) => {
    jct.d.gebi("jct_inputs_plugin").innerHTML = jct.inputs_plugin_html;
    jct.d.gebi("jct_results_plugin").innerHTML = jct.results_plugin_html;
    jct.d.gebi("jct_tiles_plugin").innerHTML = jct.tiles_plugin_html;
    let f = jct.d.gebi("jct_funder");
    jct.suggesting = true;

    // index the funders for autocomplete (this must be done before we initialise or trigger the CLInputs)
    jct.indexFunders();

    window.onscroll = (e) => {
        x = window.matchMedia("(max-width: 767px)")
        let inputs = jct.d.gebi("jct_inputs_plugin")
        if (window.pageYOffset > jct.input_top && !x.matches) {
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
            if (text.length > 1) {
                let results = jct.searchFunders(text);
                let options = results.map((x) => x.record);
                callback(options);
            }
        },
        optionsTemplate : function(obj) {
            let entry = obj.name;
            if (obj.country) {
                entry += ", " + obj.country;
            }
            if (obj.abbr) {
                entry += " (" + obj.abbr + ")";
            }
            return '<a class="optionsTemplate"><span class="jct__option_publisher_title">' + entry + '</span>';
        },
        selectedTemplate : function(obj) {
            let entry = obj.name;
            if (obj.country) {
                entry += ", " + obj.country;
            }
            if (obj.abbr) {
                entry += " (" + obj.abbr;
            }
            return entry;
        },
        onChoice: function(e,el) {
            jct.choose(e,el, "funder");
        },
        selectedObjectToSearchString: function(selected) {
            return selected.name
        },
        rateLimit: 0,
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

    jct.input_top = jct.d.gebi("jct_journal-container").getElementsByTagName("input")[0].getBoundingClientRect().top

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

    // finally, bind all the modals on the page
    jct.bindModals();
}



// -------- default_config --------

jct.config={"routes": {"tj": {"calculate": "true"}, "fully_oa": {"calculate": "true", "license": ["cc-by", "cc-by-sa", "cc0"]}, "hybrid": {"calculate": "false", "license": ["cc-by", "cc-by-sa", "cc0"]}, "self_archiving": {"embargo": "0", "rights_retention": "2100-01-01", "calculate": "true", "license": ["cc-by", "cc-by-sa", "cc0"]}, "ta": {"calculate": "true", "license": ["cc-by", "cc-by-sa", "cc0"]}}, "cards": [{"match_routes": {"must": ["fully_oa"]}, "id": "fully_oa", "preferred": "true"}, {"match_qualifications": {"must": ["self_archiving.rights_retention_author_advice"]}, "match_routes": {"not": ["fully_oa"], "must": ["self_archiving"]}, "id": "sa_rr", "modal": "sa_rr"}, {"match_qualifications": {"not": ["self_archiving.rights_retention_author_advice"]}, "modal": "sa", "match_routes": {"not": ["fully_oa"], "must": ["self_archiving"]}, "id": "self_archiving", "preferred": "false"}, {"match_qualifications": {"not": ["ta.corresponding_authors"]}, "match_routes": {"must": ["ta"]}, "id": "ta", "preferred": "true"}, {"match_qualifications": {"must": ["ta.corresponding_authors"]}, "match_routes": {"must": ["ta"]}, "id": "ta_aq", "preferred": "true"}, {"modal": "tj", "match_routes": {"must": ["tj"]}, "id": "tj", "preferred": "true"}, {"match_routes": {"not": ["self_archiving", "fully_oa", "ta", "tj"]}, "id": "journal_non_compliant", "preferred": "false"}, {"match_routes": {"not": ["self_archiving", "fully_oa", "ta", "tj"]}, "id": "funder_non_compliant", "preferred": "false"}, {"match_routes": {"not": ["self_archiving", "fully_oa", "ta", "tj"]}, "id": "institution_non_compliant", "preferred": "false"}, {"match_routes": {"not": ["self_archiving", "fully_oa", "ta", "tj"]}, "id": "rights_retention_non_compliant", "preferred": "false"}], "card_order": ["fully_oa", "ta", "ta_aq", "tj", "self_archiving", "sa_rr", "journal_non_compliant", "funder_non_compliant", "institution_non_compliant", "rights_retention_non_compliant"]}


// -------- funders --------

jct.funderlist=[{"country": null, "id": "academyoffinlandaka", "abbr": "AKA", "name": "Academy of Finland"}, {"country": null, "id": "aligningscienceacrossparkinsonsasap", "abbr": "ASAP", "name": "Aligning Science Across Parkinson's"}, {"country": null, "id": "austriansciencefundfwf", "abbr": "FWF", "name": "Austrian Science Fund"}, {"country": null, "id": "billmelindagatesfoundation", "abbr": null, "name": "Bill & Melinda Gates Foundation"}, {"country": null, "id": "europeancommissionhorizoneuropeframeworkprogramme", "abbr": null, "name": "European Commission (Horizon Europe Framework Programme)"}, {"country": "Sweden", "id": "formassweden", "abbr": null, "name": "Formas"}, {"country": "Sweden", "id": "fortesweden", "abbr": null, "name": "FORTE"}, {"country": null, "id": "frenchnationalresearchagencyanr", "abbr": "ANR", "name": "French National Research Agency"}, {"country": "Jordan", "id": "highercouncilforscienceandtechnologyhcstjordan", "abbr": "HCST", "name": "Higher Council for Science and Technology"}, {"country": null, "id": "howardhughesmedicalinstitute", "abbr": "HHMI", "name": "Howard Hughes Medical Institute"}, {"country": null, "id": "luxembourgnationalresearchfundfnr", "abbr": "FNR", "name": "Luxembourg National Research Fund"}, {"country": "Italy", "id": "nationalinstitutefornuclearphysicsinfnitaly", "abbr": "INFN", "name": "National Institute for Nuclear Physics"}, {"country": "Zambia", "id": "nationalscienceandtechnologycouncilnstczambia", "abbr": "NSTC", "name": "National Science and Technology Council"}, {"country": "Poland", "id": "nationalsciencecentrepolandncn", "abbr": "NCN", "name": "National Science Centre"}, {"country": null, "id": "netherlandsorganisationforscientificresearchnwo", "abbr": "NWO", "name": "Netherlands Organisation for Scientific Research"}, {"country": null, "id": "researchcouncilofnorwayrcn", "abbr": "RCN", "name": "Research Council of Norway"}, {"country": null, "id": "sciencefoundationirelandsfi", "abbr": "SFI", "name": "Science Foundation Ireland"}, {"country": null, "id": "slovenianresearchagencyarrs", "abbr": "ARRS", "name": "Slovenian Research Agency"}, {"country": null, "id": "southafricanmedicalresearchcouncilsamrc", "abbr": "SAMRC", "name": "South African Medical Research Council"}, {"country": null, "id": "specialprogrammeforresearchandtrainingintropicaldiseasestdr", "abbr": "TDR", "name": "Special Programme for Research and Training in Tropical Diseases"}, {"country": null, "id": "templetonworldcharityfoundationtwcf", "abbr": "TWCF", "name": "Templeton World Charity Foundation"}, {"country": null, "id": "unitedkingdomresearchinnovationukri", "abbr": "UKRI", "name": "United Kingdom Research & Innovation"}, {"country": "Sweden", "id": "vinnovasweden", "abbr": null, "name": "Vinnova"}, {"country": null, "id": "wellcome", "abbr": null, "name": "Wellcome"}, {"country": null, "id": "worldhealthorganizationwho", "abbr": "WHO", "name": "World Health Organization"}]


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

jct.lang.modals.feedback = {
    title: `Feedback? Suggestion? Contact us here.`,
    body: `<p>This tool is delivered by <a href="https://cottagelabs.com/" target="_blank" rel="noopener">
        Cottage Labs</a> on behalf of <a href="https://www.coalition-s.org/" target="_blank" rel="noopener">cOAlition S</a>. </p>
        <p>If you believe that there is an error in the result given by the tool or how the tool is functioning 
        please use this form. Your current search details will be automatically included in your feedback. 
        We will respond within 3 working days.</p>
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
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.88002 24.4048C4.99391 24.4685 5.11979 24.5 
                        5.24492 24.5C5.4165 24.5 5.58734 24.4416 5.72445 24.3269L10.9109 20.0044H14.2242C19.6018 20.0044 
                        23.9768 15.6286 23.9768 10.2518C23.9768 4.87501 19.6018 0.5 14.225 0.5H9.75255C4.37501 0.5 0 
                        4.87501 0 10.2518C0 13.8438 2.01854 17.1609 5.18872 18.8527L4.50389 23.6443C4.45968 23.9523 
                        4.60953 24.2542 4.88002 24.4048ZM1.49855 10.2518C1.49855 5.70071 5.20071 1.99855 9.75255 
                        1.99855H14.2242C18.7761 1.99855 22.4782 5.69996 22.4782 10.2518C22.4782 14.8036 18.7761 
                        18.5058 14.2242 18.5058H10.6397C10.4644 18.5058 10.295 18.5672 10.1602 18.6789L6.26243 21.9277L6.74721 
                        18.5298C6.79442 18.2016 6.62059 17.8824 6.32013 17.7438C3.39122 16.3891 1.49855 13.449 1.49855 
                        10.2518ZM6.74347 8.01597H17.2333C17.6477 8.01597 17.9826 7.6803 17.9826 7.2667C17.9826 6.8531 
                        17.6477 6.51743 17.2333 6.51743H6.74347C6.32987 6.51743 5.99419 6.8531 5.99419 7.2667C5.99419 
                        7.6803 6.32987 8.01597 6.74347 8.01597ZM6.74347 14.0102H12.7377C13.152 14.0102 13.4869 13.6752 
                        13.4869 13.2609C13.4869 12.8473 13.152 12.5116 12.7377 12.5116H6.74347C6.32987 12.5116 5.99419 
                        12.8473 5.99419 13.2609C5.99419 13.6752 6.32987 14.0102 6.74347 14.0102ZM17.2333 11.0131H6.74347C6.32987 
                        11.0131 5.99419 10.6774 5.99419 10.2638C5.99419 9.8502 6.32987 9.51452 6.74347 9.51452H17.2333C17.6477 
                        9.51452 17.9826 9.8502 17.9826 10.2638C17.9826 10.6774 17.6477 11.0131 17.2333 11.0131Z" fill="black"></path>
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
        </p>` // Feedback modal uses generic id names. If embedding in the plugin, need to change id names
}

jct.modal_setup.feedback = () => {
    // WARNING: Feedback modal uses generic id names. If embedding in the plugin, need to change id names
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
                    "url" : jct.get_fom_url()
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
        jct.closeModal();
        return false
    });
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


