# SEO description fallback.
# Populates page.description for collection documents that don't define one,
# so jekyll-seo-tag emits a useful meta description / og:description instead
# of falling back to site.description (which causes duplicates across pages).
#
# Order of preference per document:
#   1. page.description (explicit, leave it alone)
#   2. page.subtitle    (already authored for many projects)
#   3. First paragraph of content, stripped of markdown / HTML

module SeoFallback
  COLLECTIONS = %w[news projects blog].freeze
  MAX_LEN = 200

  def self.derive(doc)
    return doc.data['description'] if doc.data['description'].to_s.strip != ''
    return doc.data['subtitle']    if doc.data['subtitle'].to_s.strip != ''

    raw = doc.content.to_s
    # Strip footnote markers, links (keep label), images, code, headings, emphasis.
    plain = raw
      .gsub(/\[\^[^\]]+\]/, '')                 # [^footnote] markers
      .gsub(/!\[[^\]]*\]\([^)]*\)/, '')          # ![alt](img)
      .gsub(/\[([^\]]+)\]\([^)]+\)/, '\1')       # [text](url) -> text
      .gsub(/`[^`]*`/, '')                       # inline code
      .gsub(/^#+\s*/, '')                        # headings
      .gsub(/[*_~]+/, '')                        # emphasis
      .gsub(/<[^>]+>/, '')                       # raw HTML tags
      .strip

    first_para = plain.split(/\n\s*\n/).first.to_s.gsub(/\s+/, ' ').strip
    return nil if first_para.empty?

    first_para.length > MAX_LEN ? first_para[0, MAX_LEN - 1].rstrip + '…' : first_para
  end
end

Jekyll::Hooks.register(:documents, :pre_render) do |doc|
  next unless SeoFallback::COLLECTIONS.include?(doc.collection.label)
  derived = SeoFallback.derive(doc)
  doc.data['description'] = derived if derived
end
