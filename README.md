pdftools
========

Some scripts that help me automate my science

License: MIT

getbib.sh
---------
**Usage:** `getbib.sh DIR`, where `DIR` must be a directory containing some PDF files.
        
**Input:** all PDF files in the `DIR`

**Output:** automatically generated bibtex for yout drafty papers

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
whereafter you will likely throw away 90% of the papers. After that phase I usually hand craft some perfect bibtext files based on google scholar and common sense.

**Open Issues**

*Issue 1:* "It work for just for me!" - This is the very first version and has many things hard coded. *TODO:* make reusable






