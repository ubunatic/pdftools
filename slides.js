(function(window,undefined){
	//var svg;
	window.lastSlide = 0;
	function getByAttr(attr,value) {
		return function() { return $(this).attr(attr) == value }
	}
	function matchAttr(attr,regex) {
		return function() { return (""+$(this).attr(attr)).match(regex) }
	}
	function getLayers() {
		return svg.find("g").filter( getByAttr("inkscape:groupmode", "layer") )
	}
	function jqLog() {
		var args = Array.prototype.slice.apply(arguments,[0]);
		for(var i in args){
			var arg = args[i]
			console.log(arg[0])
		}
	}
	function jqattr(attr,alias) {
		if(!alias) alias = attr
		$.fn[alias] = function(value) {
			if(value === undefined) return this.attr(attr)
			else                    return this.attr(attr,value)
		};
	}
	function jqext(fnName,alias) {
		if(alias) $.fn[alias] = $.fn[fnName]
	}

	function getUrlParams(){
		var str = location.search || "?s=0"
		var params = {}
		str.split("?").slice(1).join("?").split("&").map( function(d) {
			d = d.split("=")
			if      (d[0].match(/^s[lide]*.*/))     params.slide    = parseInt(d[1])
			else if (d[0].match(/^o[verview]*.*/))  params.overview = true
			else                                    params[d[0]]    = d[1]
		})
		console.log("read url params:", params, "from", location.search)
		return params
	}
	function setURLParams(num,overview){
		var baseUrl, url, p = []
		if(num > 0)  p.push("s=" + num)
		if(overview) p.push("o")
		if(p.length > 0) p = "?" + p.join("&")
		else             p = ""
		baseUrl = location.href.split("?")[0];
		history.replaceState({}, document.title, url = baseUrl + p);
	}

	var yo = 0, xo = 0;
	function vb(x,y,w,h) { return [x - xo, y - yo, w, h].join(" ") }

	function setAttrsNS(trg,obj){
		for(var k in obj) trg.setAttributeNS(null,k,obj[k]);
	}

	var aniFast  = { begin: "indefinite", dur:   "0.1s", fill:  "freeze" }
	var aniShort = { begin: "indefinite", dur:   "0.3s", fill:  "freeze" }
	var aniLong  = { begin: "indefinite", dur:   "0.5s", fill:  "freeze" }
	var animateView, animateBorder, animateFill, animateDisplay;
	function setView(newBox,rect) {
		var pn,cpn,o;
		//if(!animateView)       animateView       = getAnimationFn(svg,  "viewBox",aniShort)
		if(!animateBorder)     animateBorder     = getAnimationFn(views,"stroke", aniLong)
		if(!animateFill)       animateFill       = getAnimationFn(views,"fill",   aniFast)
		if(!animateDisplay)    animateDisplay    = function(v,e){ $(e = e || views).css( "display",v) }
		if(!animateView)       animateView       = function(v,e){ $(e = e || svg  ).attr("viewBox",v)  }
		animateView(newBox)
		pn = $(".pageNumber")
		pn.css("fill","none")
		if(rect){
			animateBorder("none")
			//animateFill("rgba(255,255,255,1.0)")
			//animateFill("rgba(255,255,255,0.0)",rect)
			//animateFill("none",rect)
			animateDisplay("none",rect)
			//animateBorder("none",rect)
			try {
				o = rect[0]; cpn = o.pageNumberElement
				cpn.css("fill","gray")
				cpn.css("font-size", o.origFontSize)
				cpn.text(o.pageNumberText)
			}
			catch (e) {}
		}
		else {
			pn.css("fill","gray")
			pn.css("font-size", "60px")
			//animateFill("rgba(255,255,255,0.0)")
			animateBorder("silver")
			animateDisplay("block")
			$(tmp).each(function(){
				var o = $(this)[0]; o.pageNumberElement.text(o.pageNumber)
			})
		}
	}

	function getAnimationFn(selector,attr,defaults) {
		var getAni = function(elem) {
			return $(elem).find(">animate[attributeName="+attr+"]")
		}
		var fn = function(value,elem) {
			if(!elem) elem = selector
			$(elem).each(function(){
				var ani = getAni(this);
				if(ani.length == 0) $(this).append(ani = $(document.createElementNS(svgns,"animate")))
				var oldValue = ani.attr("to") || $(this).attr(attr)
				ani.attr(defaults)
				ani.attr({ attributeName: attr, from:  oldValue, to: value });
			})
			getAni(elem).each(function(){this.beginElement()});
		}
		return fn
	}

	function getEndSlide(){
		return (tmp.filter(function(s){ return ($(s).attr("class") == "lastSlide") }) || [])[0]
	}

	var pageNumberStyle = "font-size:12px;font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;text-align:start;line-height:125%;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:gray;stroke:none;font-family:Arial;"

	function addPageNumbers() {
		var n = 0;
		var textHeight = function(elem,def) { return $(elem).height() || parseInt($(elem).css("font-size")) || def || 12 }
		tmp.map( function(d,i) {
			var text = $(document.createElementNS(svgns,"text"))
			var rect = $(d)
			var o    = rect[0]
			var str = ""
			var lastIndex = tmp.indexOf(getEndSlide())
			if(lastIndex == -1) lastIndex = tmp.length - 1
			window.lastSlide     = lastIndex
			window.veryLastSlide = tmp.length
			if(rect.attr("id").match(/title/g)) str = ""
			else str = (n += 1) + "/" + (lastIndex)
			text.text(str)
			text.attr("style",pageNumberStyle)
			text.attr("class","pageNumber")
			slides.append(text)
			var h = 1*rect.attr("height")
			var w = 1*rect.attr("width")
			var s,fs;
			if(w/4 > h/3) s = w/textHeight(text)
			else          s = h/textHeight(text)
			text.css("font-size", fs = 1.3*s + "%")
			text.attr("transform",$(d).attr("transform"))
			text.attr("x", 1*rect.attr("x") + w/2 - text.width()     * 1.1 )
			text.attr("y", 1*rect.attr("y") + h   - textHeight(text) * 0.2 )
			console.log("adding page number at for slide",i,"num:",n,s,fs)
			o.pageNumberElement = text
			o.pageNumberText = str
			o.pageNumber     = i+1
			o.origFontSize   = fs
		})
	}

	function colorHeadings(){
		var main   = svg.find("#mainTitleText").find("text, tspan")
		var font   = svg.find(".titleFont").css("font-family")
		var h, isHead;
		if(font && main.length > 0){
			isHead = function(){
				return (
					parseInt($(this).css("font-size")) >= 26 &&
					main.index(this) == -1 &&
					$(this).css("font-family") == font
				)
			}
			h = svg.find("text, tspan").filter(isHead);
			h.css("fill","navy")
			//console.log("headings",h)
		}
	}
	
	var num = -1, svgns = "http://www.w3.org/2000/svg"
	window.setSlide = function(i){
		var x,y,w,h;
		i = Math.max(0,Math.min(i,views.length-1));
		rect = $(tmp[i])
		num = i;
		x = rect.x()*1; y = rect.y()*1
		w = rect.w()*1; h = rect.h()*1
		var w0 = $(window).width()  || window.innerWidth,
			h0 = $(window).height() || window.innerHeight;
		svg.width(w0)
		svg.height(h0)
		setView( vb(x,y,w,h),rect );
		setURLParams(num)
		console.log("slide",num,"label",rect.id())
	}

	//var tmp;
	function sortByColumn() {
		var cols = [ col = [] ],
			colStart = $(tmp[0]).x()*1,
			colEnd   = $(tmp[0]).w()*1 + colStart,
			_i, _len, d,x,y,w;
		
		for (_i = 0, _len = tmp.length; _i < _len; _i++) {
			d = $(tmp[_i]); x = d.x()*1; y = d.y()*1; w = d.w()*1;
			if(x < colEnd) { //we are still in the current col
				col.push(d.get(0))
				console.log("same col",d.id(),x,y,w,"-->",x,"<",colEnd)
			}
			else { //we are in the next col
				//col.sort(byY)
				colStart = x
				colEnd   = w + colStart
				console.log("next col",d.id(),x,y,w,"-->",colEnd)
				cols.push( col = [d.get(0)] )
			}		
			col.sort(byY);
		}
		console.log("cols",cols)
		tmp = cols.reduce( function(a,b){ return a.concat(b) }, [] )
		console.log("reduced",tmp)
	}
	function byX(a,b){
		if(isNaN(a)) a = $(a).x();
		if(isNaN(b)) b = $(b).x();
		return a - b
	}
	function byY(a,b){
		if(isNaN(a)) a = $(a).y();
		if(isNaN(b)) b = $(b).y();
		return a - b
	}

	function copyViews() {
		tmp = [];
		var _i,_len,v;
		for (_i = 0, _len = views.length; _i < _len; _i++) {
			v = views[_i];
			tmp.push(v);
		}
		tmp.sort(byX)
		sortByColumn()
		console.log("copied",tmp)
	}

	var wsvg = 0, hsvg = 0;
	function resetView(){
		num = -1;
		//svg.width(wsvg)
		//svg.height(hsvg)
		//svg.viewBox("0 0 " + wsvg + " " + hsvg)
		//views.css("stroke","gray");
		setURLParams(num,true)
		setView( vb(xo,yo,wsvg,hsvg) )
	}

	var KEYS = {
		UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39,
		PAGE_UP: 33, PAGE_DOWN: 34,
		HOME: 36, END: 35,
		F5: 116,
		ESC: 27, ENTER: 13, SPACE: 32, BACK: 8,
		G: 71, E: 69, B: 66, W: 87
	};
	var CODES = {}
	for(key in KEYS){ CODES[KEYS[key]] = key; }
	[0,1,2,3,4,5,6,7,8,9].map( function(i){ CODES[i+48] = i; CODES[i+96] = i } );

	var gotoTimeout = null, gotoNum = "";

	function startGoto()  { stopGoto(); gotoTimeout = setTimeout(gotoSlide,1000)  }
	function stopGoto()   { clearTimeout(gotoTimeout); gotoNum = ""               }
	function gotoSlide()  {
		var n = parseInt(gotoNum)
		if(!isNaN(n)) setSlide(n)
		stopGoto()
	}
	function addGotoNum(n){
		gotoNum += ""+n
		if(parseInt(gotoNum)*10 > tmp.length ) gotoSlide()
	}

	function black(){
		$(svg).css("opacity",0.0)
		$(svg).css("background-color","black")
	}
	function white(){
		$(svg).css("opacity",0.0)
		$(svg).css("background-color","white")
	}
	function clear() {
		$(svg).css("opacity",1.0)
		$(svg).css("background-color",null)
	}

	function resolveKey(e){
		var k = e.keyCode, n = CODES[k]
		switch(k) {
			case KEYS.HOME:;
			case KEYS.END:  resetView(); break;

			case KEYS.DOWN:;
			case KEYS.SPACE:;
			case KEYS.RIGHT:;
			case KEYS.PAGE_DOWN: setSlide(num+1); break;

			case KEYS.UP:;
			case KEYS.LEFT:;
			case KEYS.BACK:;
			case KEYS.PAGE_UP: setSlide(num-1); break;

			case KEYS.G:       startGoto(); break;
			case KEYS.ENTER:   gotoSlide(); break;

			case KEYS.ESC:     clear(); break;
			case KEYS.B:       black(); break;
			case KEYS.W:       white(); break;

			default:
				console.log(e.keyCode,"-->",CODES[e.keyCode]);
				if(!isNaN(n)) addGotoNum(CODES[k])
				else gotoSlide();
				return true;
		}
		return false;
	}

	function slideWheel(e) {
		if(e.originalEvent.wheelDelta > 0) setSlide(num-1);
		if(e.originalEvent.wheelDelta < 0) setSlide(num+1);
		return false;
	}

	function slideClick(e) {
		//console.log(e);
		//views.css("stroke","red")
		if(num < 0) {// overview mode
			setSlide(tmp.indexOf(e.target))
			noHoverView();
		}
		else {
			setSlide(num+1);
		}
		return false;
	}
	function hoverView(e) {
		if(num < 0) { // overview mode
			$(this).css("cursor","pointer")
			//$(this).css("stroke","blue")
			//$(this).css("fill","rgba(0,0,0,0.1)")
			animateFill("rgba(0,0,0,0.1)",$(this))
		}
		else {
			//$(this).css("stroke","none")
		}
	}
	function noHoverView(e) {
		e = (e)? this : rect
		animateFill("none",$(e))
		$(e).css("fill","none")
		$(e).css("cursor","default")
		//if(num < 0)	$(e).css("stroke","red")
		//else        $(e).css("stroke","none")
	}

	function setSlideFromURL(){
		var p = getUrlParams()
		//var num = window.location.href = window.location.href.replace( /#[0-9]*$/, "#"+num )
		if(p.overview){
			setSlide(p.slide || 0)
			resetView()
		}
		else {
			if(p.slide > 0) setSlide(p.slide)
			else            setSlide(0)
		}
	}

	//Not needed anymore, just install the missing fonts!
	//function fixFont(d){
	//	return d.replace(/\ /g,"")
	//};
	function fixFonts(){
		$("text, tspan, textPath").css("white-space","pre")
	//	$("*").each( function(){
	//
	//		var fonts = $(this).css("font-family")
	//		if(fonts){
	//			fonts = fonts.split(",")
	//			fonts = fonts.map(fixFont)
	//			$(this).css("font-family",fonts.join(", "))
	//		}
	//	})
	}

	//var rect,svg,views,slides,master,layers;
	window.onload = function(){
		var matrix;
		jqattr("width", "w")
		jqattr("height","h")
		jqattr("id")
		jqattr("y")
		jqattr("x")
		jqattr("viewBox")
		console.log("starting slides", window, $);
		//var svg,view,x,y,w,h,x0,x1,y0,y1,w0,w1,h0,h1,scale,slides,master;
		svg     = $("svg")
		wsvg = svg.width()
		hsvg = svg.height()
		layers  = getLayers()
		master  = layers.filter( matchAttr("inkscape:label", /master/i ))
		slides  = layers.filter( matchAttr("inkscape:label", /slides/i ))
		views   = slides.find("rect")
		copyViews();
		views.attr("pointer-events","visible")
		views.hover( hoverView,noHoverView )
		$(document).bind( "keydown",    resolveKey )
		$(document).bind( "click",      function(){ setSlide(num+1) } )
		$(window).bind(   "resize",     function(){ setSlide(num)   } )
		$(views).bind(    "click",      slideClick)
		$(views).bind(    "mousewheel", slideWheel)
		matrix = slides[0].transform.baseVal.getItem("translate").matrix
		xo = -matrix.e
		yo = -matrix.f
		addPageNumbers()
		colorHeadings()
		fixFonts()
		setSlideFromURL()
	}
})(this);
