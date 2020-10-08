let clinput = {};

clinput.init = (params) => {
    let element = params.element;
    let initialTemplate = params.initialTemplate;

    let frag = "";
    frag = initialTemplate()
    element.innerHTML = frag;


}