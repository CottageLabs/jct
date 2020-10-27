jct.d.gebi('feedback').addEventListener("click", (e) => {
    e.preventDefault();
    let modal = jct.d.gebi('modal_feedback')
    jct.d.gebi('message').value = "";
    jct.d.gebi('feedback_success').style.display = "none";
    jct.d.gebi('feedback_error').style.display = "none";
    modal.style.display = 'block';
});

window.onclick = (e) => {
    let modals = [].slice.call(jct.d.gebc("modal"));
    if (modals.includes(e.target)){
        e.target.style.display = "none";
    }
}

jct.d.each("close", (el) => {
    el.addEventListener("click", (e) => {
        let id = e.target.getAttribute("data-id");
        let modal = document.getElementById(id);
        modal.style.display = "none";
    })
})
