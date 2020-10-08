let clinput = {};

clinput.CLInput = class {
    constructor(params) {
        this.timer = null;
        this.delay = params.rateLimit || 0;
        this.value = "";
        this.options_method = params.options;
        this.options = [];
        this.id = params.id;

        let element = params.element;
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

        element.innerHTML = '<label for="' + this.id + '">' + label + '</label> \
                <input type="text" id="' + this.id + '" name="' + this.id + '" which="' + this.id + '" ' + attrsFrag + '>';

        let input = document.getElementById(this.id);
        input.addEventListener("focus", () => {this.setTimer()})
        input.addEventListener("blur", () => {this.setTimer()})
    }

    unsetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    setTimer() {
        if (!this.timer) {
            this.timer = window.setInterval(() => {
                this.lookupOptions();
            }, this.delay);
        }
    }

    lookupOptions() {
        let input = document.getElementById(this.id);
        if (this.value !== input.value) {
            this.value = input.value;
            this.options = this.options_method(this.value);
            console.log(this.options);
        }
    }
}

clinput.init = (params) => {
    return new clinput.CLInput(params)
}