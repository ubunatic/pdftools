#!/usr/bin/env coffee

phantom = require "node-phantom"

usage = (text="") ->
	console.warn """

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

	"""
	console.warn text

exit = (code=0) -> process.exit code

#console.warn process.argv
#waitFor = (fn,cb) ->
#	if fn() then cb?() else setTimeout (-> waitFor fn,cb), 100

extractOption = (short,long,args,arg=null) ->
	["-" + short, "--" + long].map (o) ->
		while (i = args.indexOf(o)) >= 0 then arg = args.splice i,1
	arg

args = process.argv[2..]
CLICK = extractOption "c", "click", args #remove click option where ever it is
HELP  = extractOption "h", "help",  args #remove help option
[SVGFILE,DIR] = args                     #the remainder must be file and dir
DIR ?= "."

if HELP? then usage(); exit()

if not SVGFILE?
	usage()
	throw "BadArgumentError: SVGFILE parameter not set"
	process.exit()
else console.log "printing",SVGFILE,"to",DIR

phantom.create (err,ph) ->
	ph.createPage (err,p) ->
		p.setViewport width: 1600, height: 900, (err) ->

			baseUrl = SVGFILE
			pageCount = 0 #used to name the output files consecutively

			openPage = (url=baseUrl,search="",cb) ->
				if search != "" then search = "?" + search
				url = "#{SVGFILE}#{search}"
				p.open url, (err,status) ->	console.log "page: #{url} loaded, status:", status; cb()

			clickPage = (cb) ->	p.evaluate (-> $(document).click()), ->
				console.log "Click!"; cb() #setTimeout cb, 100

			#opens and prints a single page in phantom
			printCurrentPage = print = (cb) ->
				p.render file = "#{DIR}/#{SVGFILE}-#{pageCount++}.pdf", (err) ->
					if err? then console.error "ERROR: failed to write #{file}"
					else         console.log   "file: #{file} written"
					cb()

			#sets up and runs all print calls required to print the full slide set
			printPages = ->
				lastSlide = veryLastSlide = 0
				next = -> calls.shift()?()
				calls = [
					-> openPage baseUrl,"", -> print -> next()
					-> p.evaluate (-> window.lastSlide),     (e,r) -> lastSlide     = r unless e?; next()
					-> p.evaluate (-> window.veryLastSlide), (e,r) -> veryLastSlide = r unless e?; next()
					-> addPrintCalls(); addStop(); next()
				]
				addPrintCalls = ->
					console.log "printing additional slides up to #{lastSlide} (#{veryLastSlide})."
					if lastSlide > 0 then [1..lastSlide].map (num) ->
						if CLICK then calls.push ->	clickPage -> print -> next()
						else          calls.push ->	openPage baseUrl,"s=#{num}", -> print -> next()
				addStop = -> calls.push -> ph.exit()
				next()

			printPages() #try to print the first page in any case
