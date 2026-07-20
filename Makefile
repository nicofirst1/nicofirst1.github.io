# chruby is a shell function, so every Ruby target must source it first.
SHELL := /bin/bash
CHRUBY := source /opt/homebrew/opt/chruby/share/chruby/chruby.sh && chruby 3.3.1

.PHONY: serve build install images

serve: ## chruby 3.3.1 + jekyll serve with live reload
	$(CHRUBY) && bundle exec jekyll serve --livereload

drafts: ## serve with unpublished _blog/ posts visible (published: false)
	$(CHRUBY) && bundle exec jekyll serve --livereload --unpublished

build: ## production-style build into _site
	$(CHRUBY) && bundle exec jekyll build

install: ## bundle install under the right Ruby
	$(CHRUBY) && bundle install

images: ## regenerate responsive WebP variants (480w/960w)
	./scripts/generate_image_variants.sh
