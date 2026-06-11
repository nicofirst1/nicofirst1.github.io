# og:type fix for static pages.
# Documents in the `pages` collection (home, blog index, projects, CV, ...)
# get a spurious `date` from the file mtime, which makes jekyll-seo-tag emit
# og:type="article" + article:published_time. These are not articles, so
# rewrite the rendered head back to og:type="website".
Jekyll::Hooks.register(:documents, :post_render) do |doc|
  next unless doc.collection.label == 'pages'
  next unless doc.output

  doc.output = doc.output
    .sub(%r{<meta property="og:type" content="article" />}, '<meta property="og:type" content="website" />')
    .sub(%r{<meta property="article:published_time" content="[^"]*" />\s*}, '')
end
