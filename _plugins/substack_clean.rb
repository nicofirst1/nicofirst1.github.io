# Liquid filter that prepares rendered post HTML for syndication to Substack
# (consumed by feed-substack-import.xml). Substack runs no custom JS/CSS and
# sanitizes inline SVG/scripts, so this filter:
#   1. strips the employer disclaimer code block
#   2. replaces client-side D3 viz placeholders (<div data-viz>) with a link
#      to the live interactive version on the canonical site
#   3. absolutizes root-relative src/srcset/href so Substack can fetch assets
#
# Usage in the feed: {{ post.content | substack_clean: post.url }}
module Jekyll
  module SubstackFilter
    def substack_clean(content, post_url = nil)
      site = @context.registers[:site]
      base = "#{site.config['url']}#{site.config['baseurl']}".chomp('/')
      full_url = post_url ? "#{base}#{post_url}" : base
      html = content.to_s.dup

      # 1) remove the employer disclaimer, anchored on its distinctive phrase so it
      #    matches whether kramdown renders it as an inline code span or a fenced block
      phrase = 'views and opinions expressed in this blog'
      html = html.gsub(%r{<p><code[^>]*>[^<]*#{phrase}[^<]*</code></p>\s*}mi, '')
      html = html.gsub(%r{<div class="language-plaintext highlighter-rouge">.*?#{phrase}.*?</code></pre></div></div>\s*}mi, '')

      # 2) replace interactive chart placeholders with a link to the live version
      html = html.gsub(%r{<div\s+data-viz="([^"]*)"[^>]*>\s*</div>}mi) do
        name = Regexp.last_match(1).tr('-_', '  ').strip.capitalize
        %(<p style="text-align:center;margin:1.5rem 0;padding:1rem;border:1px dashed #b91c1c;border-radius:6px;">) +
          %(\u{1F4CA} <strong>Interactive chart: #{name}</strong><br/>) +
          %(This chart is interactive on the original post — <a href="#{full_url}">explore it live here</a>.</p>)
      end

      # 2.5) footnotes can't survive import as clickable (Substack strips the target
      #      ids), so flatten kramdown footnotes to plain numbered endnotes under a
      #      "Notes" heading — numbers are kept, dead in-page links removed.
      # drop the author's manual "Footnotes" heading (we add our own "Notes")
      html = html.gsub(%r{<h[1-3][^>]*id="footnotes"[^>]*>.*?</h[1-3]>\s*}mi, '')
      html = html.gsub(%r{<h[1-3][^>]*>\s*Footnotes\s*</h[1-3]>\s*}mi, '')
      # reference markers: keep the number, drop the dead link
      html = html.gsub(%r{<sup[^>]*id="fnref:[^"]*"[^>]*>\s*<a[^>]*href="#fn:[^"]*"[^>]*>([^<]*)</a>\s*</sup>}mi) do
        "<sup>#{Regexp.last_match(1)}</sup>"
      end
      # the endnotes block: label it, drop list-item ids and the dead back-links
      html = html.gsub('<div class="footnotes" role="doc-endnotes">', '<hr /><h3>Notes</h3><div class="footnotes">')
      html = html.gsub(%r{<li id="fn:[^"]*"[^>]*>}mi, '<li>')
      html = html.gsub(%r{\s*<a[^>]*class="reversefootnote"[^>]*>.*?</a>}mi, '')

      # 3) absolutize root-relative asset/link URLs (skip anchors and protocol-relative)
      html = html.gsub(%r{(src|href)="/(?![/])}, %(\\1="#{base}/))
      html = html.gsub(%r{srcset="/(?![/])}, %(srcset="#{base}/))

      html
    end
  end
end

Liquid::Template.register_filter(Jekyll::SubstackFilter)
