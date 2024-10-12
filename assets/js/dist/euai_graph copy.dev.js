"use strict";

// Create and render the graph
function createGraph(data) {
  var _setupGraphContainer = setupGraphContainer(),
      svg = _setupGraphContainer.svg,
      g = _setupGraphContainer.g,
      color = _setupGraphContainer.color; // Render nodes, links, and labels


  var filteredLinks = filterLinkLabelsAndArrows(data.links);
  var linkElements = renderLinks(g, filteredLinks);
  var nodeElements = renderNodes(g, data.nodes, color);
  renderNodeLabels(g, data.nodes);
  renderLinkLabels(g, filteredLinks); // Create the interactive legend for filtering nodes by category

  createLegend(color, data.nodes, nodeElements, linkElements); // Setup simulation and add interactivity

  setupSimulation(data, nodeElements, filteredLinks, g);
} // Define arrow markers for directional links


function setupMarkers(svg) {
  svg.append("defs").selectAll("marker").data(["end"]).enter().append("marker").attr("id", function (d) {
    return d;
  }).attr("viewBox", "0 -5 10 10").attr("refX", 15).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#aaa");
} // Render links with directional arrows


function renderLinks(g, links) {
  return g.append("g").attr("class", "links").selectAll("line").data(links).enter().append("line").attr("class", "link").style("stroke-width", 2).style("stroke", "#aaa").attr("marker-end", "url(#end)");
} // Render nodes with category-specific colors


function renderNodes(g, nodes, color) {
  return g.append("g").attr("class", "nodes").selectAll("circle").data(nodes).enter().append("circle").attr("class", "node").attr("r", 10).style("fill", function (d) {
    return color(d.category);
  }).on("mouseover", function (event, d) {
    return showTooltip(event, d);
  }).on("mouseout", function () {
    return hideTooltip();
  }).on("click", function (event, d) {
    return showInfo(d);
  }).call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));
} // Render node labels


function renderNodeLabels(g, nodes) {
  g.append("g").attr("class", "node-labels").selectAll("text").data(nodes).enter().append("text").attr("class", "node-label").attr("dy", -15).attr("text-anchor", "middle").text(function (d) {
    return d.showname;
  });
} // Render link labels


function renderLinkLabels(g, links) {
  g.append("g").attr("class", "link-labels").selectAll("text").data(links).enter().append("text").attr("class", "link-label").attr("dy", 5).attr("text-anchor", "middle").text(function (d) {
    return d.reason;
  });
} // Create the interactive legend for categories


function createLegend(color, nodes, nodeElements, linkElements) {
  var categories = Array.from(new Set(nodes.map(function (node) {
    return node.category;
  })));
  var legend = d3.select("#graph-container").append("div").attr("class", "legend").style("position", "absolute").style("top", "10px").style("right", "10px").style("background", "#fff").style("padding", "10px").style("border", "1px solid #ddd").style("border-radius", "5px");
  categories.forEach(function (category) {
    var legendItem = legend.append("div").style("margin", "5px").style("cursor", "pointer").style("display", "flex").style("align-items", "center");
    legendItem.append("div").style("width", "12px").style("height", "12px").style("background", color(category)).style("margin-right", "5px");
    legendItem.append("span").text(category); // Add click handler to show/hide nodes and links of this category

    legendItem.on("click", function () {
      return toggleCategory(category, nodeElements, linkElements);
    });
  });
} // Toggle visibility of nodes and links by category


function toggleCategory(category, nodeElements, linkElements) {
  var nodesToToggle = nodeElements.filter(function (d) {
    return d.category === category;
  });
  var linksToToggle = linkElements.filter(function (link) {
    return link.source.category === category || link.target.category === category;
  });
  var isVisible = nodesToToggle.style("opacity") === "1";
  nodesToToggle.transition().duration(500).style("opacity", isVisible ? 0 : 1);
  linksToToggle.transition().duration(500).style("opacity", isVisible ? 0 : 1);
}