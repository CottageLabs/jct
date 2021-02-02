import os

read_files = ["api_endpoint", "clinput", "jct", "detailed_results", "feedback", "plugin"]

with open(os.path.join("static", "jct_plugin.js"), "w") as outfile:
    for f in read_files:
        with open(os.path.join("static", f + ".js"), "r") as infile:
            outfile.write("\n// -------- " + f + " --------\n\n")
            outfile.write(infile.read())
            outfile.write("\n\n")
