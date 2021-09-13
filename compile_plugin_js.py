import os

read_files = ["i_am_a_widget", "api_endpoint", "clinput", "jct", "find_out_more", "feedback", "plugin"]

with open(os.path.join("static", "js", "jct_plugin.js"), "w") as outfile:
    for f in read_files:
        with open(os.path.join("static", "js", f + ".js"), "r") as infile:
            print("reading... {}".format(f))
            outfile.write("\n// -------- " + f + " --------\n\n")
            outfile.write(infile.read())
            outfile.write("\n\n")
