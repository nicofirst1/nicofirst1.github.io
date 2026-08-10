---
title: TerraSelect | EU Site-Suitability Scorer for AI Gigafactories
subtitle: Modular geospatial pipeline that overlays 15+ public EU datasets into a single suitability surface
layout: projects
custom_id: terraselect
tag: past
image: /assets/images/projects/terraselect.png
button_link: https://github.com/nicofirst1/terraselect
button_name: View on GitHub
---

**TerraSelect** is a modular geospatial site-suitability scorer built to study where AI Gigafactories _could_ plausibly land across Europe — the same question the EU is asking as it allocates €20 billion in Gigafactory funding.

<video controls preload="metadata" poster="/assets/images/projects/terraselect-video-poster.jpg" class="w-full my-6 rounded">
  <source src="/assets/images/projects/terraselect.mp4" type="video/mp4">
  Your browser doesn't support embedded video. <a href="/assets/images/projects/terraselect.mp4">Download the elevator pitch</a>.
</video>

It overlays public EU datasets — land cover, terrain, power infrastructure, water bodies, transmission lines, internet exchanges, protected areas, regional R&D capacity, and more — onto a grid of candidate cells, scores each layer independently with a customisable rule (distance decay, attribute weighting, normalisation), and combines the layers into a single suitability surface you can explore interactively.

The project ships three surfaces from one codebase: a **Streamlit explorer** for interactive map-driven analysis, a **CLI** for batch generation of per-layer score grids, and a **Docker image** that bundles app + dependencies so data updates don't require rebuilds. Fifteen-plus loaders cover the EU public-data landscape (Copernicus, Eurostat, OpenStreetMap, Natura 2000, EU-Hydro, OpenAlex, and others), each with its own scoring rule and license-aware attribution.

TerraSelect is open source under Apache-2.0. The reference blog post — **["AI Gigafactories: Europe's €20B Race and the Site Selection Challenge"](/blog/ai-gigafactories-tool/)** — walks through the policy context, the methodology, and the practical pitfalls of stitching together EU geospatial data without a unified standard. For background on the smaller-scale scheme Gigafactories build on, see **["AI Factories: Europe's €1.5B EuroHPC Supercomputer Plan"](/blog/ai-factories/)**. Pre-built score grids for Germany and EU-wide extents are published as GitHub Releases so you can explore the suitability surface without re-downloading every upstream dataset.
