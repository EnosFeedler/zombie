default : test
.PHONY : build clean publish setup test


# Setup everything
setup :
	npm install

# CoffeeScript to JavaScript
build :
	coffee -b -c -l -o lib/zombie lib/zombie/*.coffee

# Run test suite
test : setup
	npm test


# Run coverage report
coverage : setup lib-cov html
	env LIB_PATH=lib-cov mocha -R html-cov > html/coverage.html
	echo open html/coverage.html

lib-cov : build
	jscoverage --no-highlight lib lib-cov

html/coverage.html :
	if [ `which jscoverage` ] ; then make coverage ; fi


# Remove temporary files
clean :
	rm -rf html man7
	rm -f lib/zombie/*.js
	rm -rf lib-cov


# Documentation consists of Markdown files converted to HTML, CSS/images copied over, annotated source code and PDF.
doc : html html/source html/zombie.pdf

html/index.html : README.md doc/layout/main.html
	mkdir -p html
	coffee doc/render.coffee $< $@

html/changelog.html : CHANGELOG.md doc/layout/main.html
	mkdir -p html
	coffee doc/render.coffee $< $@

html/%.html : doc/%.md doc/layout/main.html
	mkdir -p html
	coffee doc/render.coffee $< $@

html : $(foreach file,$(wildcard doc/*.md),html/$(notdir $(basename $(file))).html) html/index.html html/changelog.html
	mkdir -p html
	cp -fr doc/css doc/images html/

html/source : lib/**/*.coffee
	@echo "Documenting source files ..."
	docco lib/**/*.coffee
	mkdir -p html
	mv docs html/source

html/zombie.pdf : html/*.html
	@echo "Generating PDF documentation ..."
	wkhtmltopdf \
		--disable-javascript --outline --print-media-type --title Zombie.js --header-html doc/layout/header.html --allow doc/images \
  	--margin-left 30 --margin-right 30 --margin-top 30 --margin-bottom 30 --header-spacing 5 \
  	cover doc/layout/cover.html toc --disable-dotted-lines \
		html/index.html html/api.html html/selectors.html html/troubleshoot.html \
		html/zombie.pdf


# Man pages.
man7 : $(foreach file,$(wildcard doc/*.md),man7/zombie-$(notdir $(basename $(file))).7) man7/zombie.7 man7/zombie-changelog.7
	mkdir -p man7

man7/zombie.7 : README.md
	mkdir -p man7
	ronn --roff $< > $@

man7/zombie-changelog.7 : README.md
	mkdir -p man7
	ronn --roff $< > $@

man7/zombie-%.7 : doc/%.md
	mkdir -p man7
	ronn --roff $< > $@


# Get version number from package.json, need this for tagging.
version = $(shell node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')).version)")

# Publish site only.
publish-docs : clean html html/source html/zombie.pdf html/coverage.html
	@echo "Uploading documentation ..."
	rsync -chr --del --stats html/ labnotes.org:/var/www/zombie/

# npm publish, public-docs and tag
publish : build doc man7
	npm publish
	git push
	git tag v$(version)
	git push --tags origin master
	make publish-docs
	make clean

