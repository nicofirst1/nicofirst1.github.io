--- 
layout: default
title: Dr. Nicolo' Brandizzi
subtitle: "Building bridges between data, language, and society."
image: /assets/images/profile_picture.jpg
hero_bg: /assets/images/hero.jpg
greeting: "Ciao! I'm Nicolo'."
description: >
 My research moves between AI, data governance, and social systems. I’m interested in how structure and meaning evolve when humans and machines learn together. This site is a record of the work, collaborations, and side investigations that follow from that curiosity.

hero_highlights_title: Things that light me up lately
hero_highlights:
  - Shaping evaluation methods that capture reasoning and reliability in multilingual models.
  - Connecting AI governance frameworks with the technical realities of training and deployment.
  - Coordinating European efforts toward open, large-scale AI infrastructure.
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
