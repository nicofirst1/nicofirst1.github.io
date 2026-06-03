# Generates a dedicated single-post import feed per blog post at
#   /feed-substack/<slug>.xml
# so the Substack importer can be pointed at exactly one post (it imports every
# item in a feed as a draft — a per-post feed means re-importing never re-creates
# the whole back-catalog). Mirrors feed-substack-import.xml but scoped to one
# slug, and reuses the substack_clean filter (footnote flattening, asset
# absolutization, syndication backlink). The bulk feed stays separate/untouched.
module Jekyll
  class SubstackPostFeedGenerator < Generator
    safe true
    priority :low

    def generate(site)
      blog = site.collections['blog']
      docs = blog ? blog.docs : site.posts.docs
      docs.each do |doc|
        next if doc.data['published'] == false
        next if doc.data['draft'] == true
        slug = doc.data['slug'].to_s
        next if slug.empty?
        site.pages << SubstackPostFeedPage.new(site, doc, slug)
      rescue StandardError => e
        # never let a single bad post fail the whole site build/deploy;
        # a missing /feed-substack/<slug>.xml just 404s (visible in the issue)
        Jekyll.logger.warn "SubstackPostFeed:", "skipped #{doc.data['slug']}: #{e.message}"
      end
    end
  end

  class SubstackPostFeedPage < Page
    def initialize(site, doc, slug)
      @site = site
      @base = site.source
      @dir  = 'feed-substack'
      @name = "#{slug}.xml"

      process(@name)
      self.data = {
        'layout'     => 'none',
        'sitemap'    => false,
        'post_slug'  => slug,
        'post_title' => doc.data['title']
      }
      self.content = FEED_TEMPLATE
    end
  end

  FEED_TEMPLATE = <<~XML
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0"
         xmlns:content="http://purl.org/rss/1.0/modules/content/"
         xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>{{ site.title | default: "Website" }} – {{ page.post_title | escape }} (single post, for import)</title>
        <link>{{ '/' | absolute_url }}</link>
        <atom:link href="{{ page.url | absolute_url }}" rel="self" type="application/rss+xml" />
        <description>{{ site.description | escape }}</description>
        <language>{{ site.lang | default: 'en' }}</language>
        {% assign blog_collection = site.collections | where: 'label', 'blog' | first %}
        {% if blog_collection %}{% assign blog_docs = blog_collection.docs %}{% else %}{% assign blog_docs = site.posts %}{% endif %}
        {% assign blog_docs = blog_docs | where: 'slug', page.post_slug %}
        {% for post in blog_docs %}
          <item>
            <title>{{ post.title | escape }}</title>
            <link>{{ post.url | absolute_url }}</link>
            <guid isPermaLink="true">{{ post.url | absolute_url }}</guid>
            <pubDate>{{ post.date | date_to_rfc822 }}</pubDate>
            <author>{{ post.author | default: site.author | default: site.title | escape }}</author>
            <description>{{ post.description | default: post.title | strip_html | strip_newlines | escape }}</description>
            {% if post.image %}<enclosure url="{{ post.image | absolute_url }}" type="image/jpeg" />{% endif %}
            <content:encoded><![CDATA[{% if post.image %}<p><img src="{{ post.image | absolute_url }}" alt="{{ post.title | escape }}" /></p>{% endif %}{{ post.content | substack_clean: post.url }}]]></content:encoded>
          </item>
        {% endfor %}
      </channel>
    </rss>
  XML
end
