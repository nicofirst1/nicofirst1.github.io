---
title: MAS Traffic Control
subtitle: Interaction between autonomous and human drivers
custom_id: masTraffic
tag: past
custom_url: https://github.com/nicofirst1/MAS-Traffic-Control
image: ./assets/images/projects/mas-traffic.jpg
---

### Summary
The project models the interaction between Autonomous Agents [AA] and Human Agents [HA] in a mixed traffic environment.
We simulate various scenarios such as: selfishness vs cooperativeness in AAs, behavior of AAs with varying number of HAs and other.

### Introduction

Autonomous car are being introduces in various countries. In 2019 a total of 1,400 autonomous car have been registered in the US only. With the rising of this kind of technologies some research is needed to study and simulate the interaction between autonomous car and humans.
State of the art

In "Simulating Autonomous and Human-Driven Vehicles in Traffic Intersections" the authors study the interaction between Autonomous Agents [AA] and Human Agents [HA], using different field of views and reaction times for both type of drivers. However, their simulation shows barely any difference between both types of drivers, from which they conclude that these two properties field of view and reaction time are not the most distinctive properties.

### New Idea

Our idea is to investigate different behavior for AA in this context. Specifically we want to model a context in which there are self-centeredness vs cooperative agents. Self-centered agents would behave more Humans Agents [HA] (no communication whatsoever) but with faster reflexes and wider FOVs.