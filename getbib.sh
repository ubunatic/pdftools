#!/usr/bin/env bash

google="http://www.google.com/search?hl=en&q="

fail(){
	echo "Error: $*" > /dev/stderr
	exit 1
}

warn() {
	echo -n "$*" > /dev/stderr
}

warnl(){
	echo "$*" > /dev/stderr
}

getTime(){
	date +%s
}

pagesToText() {
	pdftotext -f $1 -l $2 "$3" /tmp/pdf.txt 2> /dev/null 1> /dev/null
}

readTitleFromText(){
	cat /tmp/pdf.txt |\
		grep -vE "^[ \s]+$" | head -20 | tr "\\n" " " |\
		sed 's/[^a-zA-Z0-9 _-]*//g'
}

readTitleFromPDF(){
	cat -v "$1" | grep -i "Title" |                    \
		sed 's#;##g'       |                           \
		sed 's#Title[ ]*(\([^)]*\))#\nTitle: \1\n#g' | \
		grep 'Title'       |                           \
		sed 's#Title: ##g' |                           \
		tr "\\n" " "
}

killBadChars() {
	sed "s# [ ]*# #g" |\
	sed "s#[^a-zA-Z0-9 _-]##g"
}

killBadTitles() {
	sed "s#.*[a-zA-Z0-9_-]\+\.\(doc\|dvi\|ps\|pdf\|qxp\|docx\|ppt\|pptx\|eps\|tif\).*##g"
}

trim() {
	sed 's#[ \t]*##g'
}

isEmpty() {
	trimmed=$( echo "*" | trim )
	[ -z "$trimmed" ] || [ ${#trimmed} -lt 30 ]
}

isError() {
	echo "$*" | grep "Error:" 2> /dev/null
}

isPositive(){
	[ "$*" -gt "0" ] 2>/dev/null
}

info() {
	pdfinfo $* 2> /dev/null
}

getTitle() {
	file=$1
	title=$( info "$1" | grep "Title:" | sed "s/Title:\s*//" | killBadTitles | killBadChars )
	page=1
	#warnl "pdfinfo: Title $title"
	maxPages=$( info "$1" | grep "Pages" | cut -d":" -f2 )
	#warnl "pdfinfo: Pages $maxPages"
	isPositive $maxPages && (( maxPages = 1 * "$maxPages" )) || maxPages=3
	[ $maxPages -gt 3 ] && maxPages=3
	while isEmpty $title && [ $page -lt $maxPages ]; do
		#[ $page -eq 1 ] && warn "searching $maxPages pages for title:"
		pagesToText $page $page "$1"
		title=$( readTitleFromText | killBadChars)
		((page++))
		#if isEmpty $title
		#then warn    " $page"
		#else warnl " $page (found title)"
		#fi
	done
	#[ $page -eq $maxPages ] && warnl " (not found, using filename)"
	#warnl "Finale Title: $title"
	isEmpty $title && title="$file"
	#echo  "Title:       ${title:0:10}"
	#warnl "Fixed Title: ${title:0:10}"
	echo "$title"
}

getYear(){
	echo "$1" | sed 's#.*\([0-9][0-9][0-9][0-9x]\).*#\1#'
}

docroot="../../../../../../../../../../../../../../home/juve/phd"

processFile(){
	file=$1
	if [ -d "$file" ]
	then echo "dir $file skipped"
	else
		[ -f "$file" ] || fail "$file is not a file"
		#warnl "grepping $file"
		title=`getTitle "$file"`
		year=` getYear  "$file"`
		base=$( basename "$file" )
		conf=$( echo "$base" | cut -d"-" -f2  )
		rest=$( echo "$base" | cut -d"-" -f3- )
		#warnl "$year ${file:12:10}:  ${title:0:100}"
		cat <<-EOF
			@article{$file,
				title={{${title:0:100}}},
				author={{${rest:0:40}}},
				journal={{$conf}},
				year={$year},
				url={{$google${title:0:75}}},
				note={{\href{$google${title:0:75}}{link}},\href{{$docroot/$file}}{file}}
			}
			EOF
	fi
}

usage() {
	cat <<-EOF
	Usage:  $0 PATH
	
	  PATH - A PDF file or a adirectory containing some PDF files
	
	Examples:

	$0 papers/1997-SIGMOD-Some-File-Name.pdf   #output: single BibTeX entry
	$0 papers                                  #output: BibTeX for all PDF files in 'papers'

	Known Issues:
	- Curently filenames must NOT have underscores
	- The files also must follow the YEAR-Conference-Title.pdf
	- Spaces my not work as expected
	
	EOF
}

noFileErrorMsg="You must specifiy a PDF file or a DIR with PDF files"

if [ $# -eq 0 ]; then
	usage
	fail "$noFileErrorMsg"
fi

start=`getTime`

if [ -f "$1" ]; then
	count=1
	processFile $1
elif	[ -d "$1" ]; then
	(( count = 1 * `ls "$1"/*.pdf | wc -l` ))
	[ $count -gt 0 ] || fail "DIR '$1' has not PDF files inside"
	count=1

	current=0
	for f in "$1"/*.pdf; do
		echo -ne "$current/$count $f \033[0K\r" > /dev/stderr
		processFile "$f"
		(( current++ ))
	done
else
	fail "PATH '$1' must be a directory or file name. $noFileErrorMsg"
fi

end=`getTime`
if [ $count -gt 0 ]; then
	(( time = end - start ))
	warnl "$count files processed"
	warnl "title extraction took $time seconds"
fi
