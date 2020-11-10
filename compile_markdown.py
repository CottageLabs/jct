import markdown, os

files = ["apidocs", "transformative-agreements", "transformative-journals", "faq", "how-it-works"]

for f in files:
    print("rendering",f)
    with open(os.path.join("markdown", f + ".md")) as md:
        html = markdown.markdown(md.read(), extensions=["markdown.extensions.fenced_code", "tables"])
    with open(os.path.join("pagefragments", f + ".html"), "w") as out:
        out.write(html)
    with open(os.path.join("pagefragments", f + ".html")) as frag, \
            open(os.path.join("pagefragments", "header.html")) as header, \
            open(os.path.join("pagefragments", "footer.html")) as footer:
        full = header.read() + frag.read() + footer.read()
    with open(os.path.join("content", f + ".html"), "w") as final:
        final.write(full)

