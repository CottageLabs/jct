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
        input.addEventListener("focus", () => {this.activateInput()})
        // input.addEventListener("blur", () => {this.unsetTimer()})
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

    unsetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    activateInput() {
        let input = document.getElementById(this.id);
        input.value = this.lastSearchValue;

        if (this.selectedObject) {
            let lsv = this.lastSearchValue.toLowerCase();
            let keys = Object.keys(this.selectedObject);

            keycheck:
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let v = this.selectedObject[key];
                if (Array.isArray(v)) {
                    for (var j = 0; j < v.length; j++) {
                        if (v[j].toLowerCase().includes(lsv)) {
                            input.value = v;
                            break keycheck;
                        }
                    }
                } else {
                    if (v.toLowerCase().includes(lsv)) {
                        input.value = v;
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
        if (this.value !== input.value && input.value.length > 0) {
            this.value = input.value;
            this.options_method(this.value, (data) => {this.optionsReceived(data)});
        } else if (input.value.length === 0) {
            let optsContainer = document.getElementById(this.id + "--options");
            optsContainer.innerHTML = "";
        }
    }

    optionsReceived(data) {
        if (!this.optionsLimit) {
            this.options = data;
        } else {
            this.options = data.slice(0, this.optionsLimit);
        }
        if (this.newValueMethod) {
            let nv = this.newValueMethod(this.value);
            if (nv) {
                this.options = [nv].concat(this.options);
            }
        }
        this._renderOptions();
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
                //this.highlighted(entries[i], true);
            });
            entries[i].addEventListener("blur", () => {
                //this.highlighted(entries[i], false);
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
        // input.value = this.options[idx];
        this.lastSearchValue = input.value;
        input.value = this.selectedTemplate(this.options[idx]);
        this.selectedObject = this.options[idx];
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

    highlighted(element, highlight) {

        if (highlight) {
            element.style.backgroundColor = "grey";
        }
        else {
            element.style.backgroundColor = "transparent";
        }
    }
}

clinput.init = (params) => {
    return new clinput.CLInput(params)
}