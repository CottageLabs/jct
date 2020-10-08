let clinput = {};

clinput.CLInput = class {
    constructor(params) {
        this.timer = null;
        this.delay = params.rateLimit || 0;
        this.value = "";
        this.options = params.options;

        let element = params.element;
        let id = params.id;
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

        let frag = '<label for="' + id + '">' + label + '</label> \
                <input type="text" id="' + id + '" name="' + id + '" which="' + id + '" ' + attrsFrag + '>';
        element.innerHTML = frag;

        let input = document.getElementById(id);
        input.addEventListener("focus", this.setTimer)
        input.addEventListener("blur", this.unsetTimer)
    }

    unsetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    setTimer() {
        if (!this.timer) {
            this.timer = window.setInterval(this.lookupOptions, this.delay);
        }
    }

    lookupOptions() {
        let input = document.getElementById(id);
        if (this.value !== input.value) {
            this.value = input.value;
            this.options(this.value);
        }
    }
}

clinput.init = (params) => {
    return new clinput.CLInput(params)
}