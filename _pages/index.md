--- 
layout: default
title: Dr. Nicolo' Brandizzi
subtitle: "Curious about how humans and machines learn together."
image: /assets/images/profile_picture.jpg
hero_bg: /assets/images/hero.jpg
greeting: "Ciao! I'm Nicolo."
description: >
  I'm an AI researcher who loves pairing rigorous systems work with the messy, human side of technology.
  On this site I share the experiments, collaborations, and field notes that help me make sense of responsible AI.
hero_highlights_title: Things that light me up lately
hero_highlights:
  - Co-designing evaluation rituals that make aligned AI feel trustworthy in practice.
  - Partnering with policy makers to bridge technical findings and real-world governance.
  - Exploring creative tools that keep multilingual teams playful while shipping serious systems.
current_focus: "Sketching kinder evaluation loops for large language models and mentoring teams on trustworthy deployment."
primary_cta:
  label: See what I'm working on
  url: /projects
secondary_cta:
  label: Say hello
  url: mailto:nicolo.brandizzi@iais.fraunhofer.de
page_id: home
permalink: /
---

{% include home/hero.html %}
{% include home/activity.html %}
{% include home/education.html data='experience' title='Recent roles & collaborations' %}
{% include home/education.html data='education' title='Learning journey' %}
