import markdown, os

files = ["apidocs", "transformative-agreements", "transformative-journals"]

for f in files:
    with open(os.path.join("markdown", f + ".md") as md:
        html = markdown.markdown(md.read(), extensions=["markdown.extensions.fenced_code"])
    with open(os.path.join("pagefragments", f + ".html", "w") as out:
        out.write(html)
    with open(os.path.join("pagefragments", f + ".html", "r") as frag,
            open(os.path.join("pagefragments", "header.html") as header,
            open(os.path.join("pagefragments", "footer.html") as footer:
        full = header.read() + frag.read() + footer.read()
    with open(os.path.join("content", f + "html", "w") as final:
        final.write(full)

