SVG and PDF Tools
=================

Some scripts that help me automate my science

Author: Uwe Jugel
License: BSD

getbib.sh
---------
**Usage:** `getbib.sh DIR`, where `DIR` must be a directory containing some PDF files.

**Input:** all PDF files in the `DIR`

**Output:** automatically generated bibtex for your drafty papers

The script uses `pdfinfo` and `pdftotext` and some GNU utils to extract the title or something similar from the docs
It also uses the PDF filename to extract the year and a useful entry for the "Author".
If you follow my naming schema the script should work fine.
The script also works for scanned PDFs and will just dissect the filename if it does not find anything useful inside the PDF

Here is an example:

    $ ls ./papers
    2005-SIGMOD-stonebraker-the-8-stream-system-requirements.pdf
    $ sh getbib.sh papers

    @article{papers/2005-SIGMOD-stonebraker-the-8-stream-system-requirements.pdf,
      title={{The 8 Requirements of Real-Time Stream Processing Michael Stonebraker Uur etintemel Stan Zdonik Comp}},
      author={{stonebraker-the-8-stream-system-requirem}},
      journal={{SIGMOD}},
      year={2005},
      url={{http://www.google.com/search?hl=en&q=The 8 Requirements of Real-Time Stream Processing Michael Stonebraker Uur e}},
      note={{\href{http://www.google.com/search?hl=en&q=The 8 Requirements of Real-Time Stream Processing Michael Stonebraker Uur e}{link}},\href{{../../../../../../../../../../../../../../home/juve/phd/papers/2005-SIGMOD-stonebraker-the-8-stream-system-requirements.pdf}}{file}}
    }

You can pipe the output into a file and use it in your documents:

    $ sh genbib.sh papers > autogen.bib

In your final PDF the reference may then look like this:

> [1] Mining-Data-Streams-a-Review.pdf. Mining Data Streams A Review Mohamed Medhat Gaber
> Arkady Zaslavsky and Shonali Krishnaswamy Centre f. SIGMOD, 2005. [link](http://www.google.com/search?hl=en&q=The 8 Requirements of Real-Time Stream Processing Michael Stonebraker Uur e),[file](\href{{../../../../../../../../../../../../../../home/juve/phd/papers/2005-SIGMOD-stonebraker-the-8-stream-system-requirements.pdf).

Of course this is far from what the academic audience regards a valid reference,
but it gets the job done for all draft work esp. if you are in constant negotiation about your content.

This purely file-based quick shot references generator may help you if you are in the "paper gathering phase"
where after you will likely throw away 90% of the papers. After that phase I usually hand craft some perfect bibtext files based on Google Scholar and common sense.

**Attention**: This is the very first version and has many things hard coded.


svgslides2pdf
-------------
I use Inkscape-built SVG + JavaScript instead of other office tools for supporting my talks and presentations.
The `svgslides2pdf` scripts help me create multi page PDF files from the SVG.

**Requirements:** phantomjs, node.js + coffee, node-phantom, svgslides2pdf.coffee

	Usage: $0 SVGFILE [options]

	Options:
		All options are passed to svgslides2pdf.coffee

	Converts an SVG slide set to pdfs via svgslides2pdf.coffee
	and merges the pdfs as SVGFILE.pdf. Will also work with
	normal html files or anything else that loads in phantomjs.

I now live ppt free for quite some time. Being able to sent my visual thoughts in convenient PDF format made this possible.

svgslides2pdf.coffee
--------------------
**Requirements:** phantomjs, node.js + coffee, node-phantom

	Usage: svgslides2pdf.coffee SVGFILE DIR [options]

	Options:
		-c | --click       Use mouse click on `document` instead of changing the Url to forward slides
		                   Attention: click-based is currently slower than reload-based switching
		-h | --help        Print this help/usage info

	1. Loads the SVGFILE in phantomjs and prints it to DIR/SVGFILE-0.pdf
	2. Reads the global var `lastSlide` from the loaded svg in phantomjs
	   and tries to load additonal pages using the Url: SVGFILE?s=NUM,
	   with NUM iterating from 1 to (including) `lastSlide`

	You may want to merge the slides afterwards using pdf merge tools,
	such as pdftk, pdfjoin, pdfunite, etc.

slide.js
--------
**Requirements**: jQuery
**Installation**: Just add this script + jQuery to your SVG (Inkscape does not interfere with the additional tags):
**Usage + Details**: see `./tutorial.svg`

