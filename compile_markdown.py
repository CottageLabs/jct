import markdown, os, io

files = ["apidocs", "transformative-agreements", "transformative-journals", "faq", "how-it-works", "notices", "widget"]

for f in files:
    print("rendering",f)
    with io.open(os.path.join("markdown", f + ".md"), mode="r", encoding="utf-8") as md:
        html = markdown.markdown(md.read(), extensions=["markdown.extensions.fenced_code", "tables"])
    with io.open(os.path.join("pagefragments", f + ".html"), mode="w", encoding="utf-8") as out:
        out.write(html)
    with io.open(os.path.join("pagefragments", f + ".html"), mode="r", encoding="utf-8") as frag, \
            io.open(os.path.join("pagefragments", "header.html"), mode="r", encoding="utf-8") as header, \
            io.open(os.path.join("pagefragments", "footer.html"), mode="r", encoding="utf-8") as footer:
        full = header.read() + frag.read() + footer.read()
    with io.open(os.path.join("content", f + ".html"), mode="w", encoding="utf-8") as final:
        final.write(full)

