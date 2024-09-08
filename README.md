# My Website
Available at [nicofirst1.github.io](https://nicofirst1.github.io/)


## Compiling and Installing

On mac you will need to run the following:
```bash

brew install yarn node
bundle
```

## Information
The website is made with [Jekyll](https://jekyllrb.com/). To start the server in a local configuration source your ruby (e.g. `chruby ruby-3.3.1`) and run
`bundle exec jekyll serve`
While in the current directory.

If you have some dependency issue you first need to install them with:
```bash
bundle install 
```



1. `yarn && bundle` or `npm i && bundle` - only the first time
2. after some edits
     - `jekyll b -d docs`
     - `git push`