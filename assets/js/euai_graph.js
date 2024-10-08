// Fetch and load the JSON data for nodes and links from the specified URL
fetch(euAIdataUrl)
  .then((response) => response.json()) // Parse JSON response
  .then((data) => initializeGraph(data)) // Initialize graph creation
  .catch((error) => console.error("Error loading data:", error)); // Catch and log any errors

// Function to initialize the graph with validated data
function initializeGraph(data) {
  if (data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
    const { nodes, links } = validateData(data); // Validate and filter nodes and links
    createGraph({ nodes, links }); // Call createGraph with validated data
  } else {
    console.error(
      "Error: Data format is incorrect or nodes/links are missing."
    );
  }
}

// Validate nodes and links to ensure consistency and return only valid links
function validateData(data) {
  const nodeIds = new Set(data.nodes.map((node) => node.id)); // Create a set of node IDs
  const validLinks = data.links.filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
  ); // Filter links that have both source and target nodes present in the node set
  return { nodes: data.nodes, links: validLinks }; // Return validated nodes and links
}

// Filter out redundant links and choose the shorter label when there are bidirectional links
function filterLinkLabelsAndArrows(links) {
  const linkMap = {}; // Initialize a map to track unique pairs of links

  links.forEach((link) => {
    const pairId = `${link.source.id}-${link.target.id}`; // Unique identifier for the link
    const reversePairId = `${link.target.id}-${link.source.id}`; // Unique identifier for reverse direction

    if (!linkMap[pairId] && !linkMap[reversePairId]) {
      // If neither direction exists, add the link
      linkMap[pairId] = link;
    } else if (linkMap[reversePairId]) {
      // If the reverse direction exists, choose the shorter reason label
      const reverseLink = linkMap[reversePairId];
      if (link.reason.length < reverseLink.reason.length) {
        delete linkMap[reversePairId]; // Remove the reverse link
        linkMap[pairId] = link; // Add the shorter reason label link
      }
    }
  });

  return Object.values(linkMap); // Return the filtered links as an array
}

// Set up the tooltip for displaying node information on hover
function setupTooltip(node) {
  // Create a tooltip div and set its initial styles
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "#f9f9f9")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Show tooltip with node's fullname on mouseover
  function showTooltip(event, d) {
    tooltip.transition().duration(200).style("opacity", 1); // Fade in tooltip
    tooltip
      .html(`${d.fullname}`)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 15 + "px");
  }

  // Hide tooltip on mouseout
  function hideTooltip() {
    tooltip.transition().duration(500).style("opacity", 0); // Fade out tooltip
  }

  node
    .on("mouseover", (event, d) => showTooltip(event, d)) // Attach event handlers for tooltip
    .on("mouseout", () => hideTooltip());
}

// Set up the SVG container and append group elements
function setupGraphContainer(margin, width, height) {
  const svg = d3
    .select("#graph-container")
    .append("svg") // Create an SVG element
    .attr("width", width + margin.left + margin.right) // Set width with margins
    .attr("height", height + margin.top + margin.bottom) // Set height with margins
    .call(
      d3.zoom().on("zoom", (event) => g.attr("transform", event.transform))
    ); // Enable zoom functionality

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`); // Append group element and apply transformation

  // Define arrow markers for directional links
  svg
    .append("defs")
    .selectAll("marker")
    .data(["end"])
    .enter()
    .append("marker")
    .attr("id", (d) => d)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#aaa"); // Define the marker's shape and color

  return g; // Return the group element for further use
}

// Set up the node information panel to show details on click
function setupInfoPanel(node, data) {
  // Show detailed node information in the sidebar
  function showInfo(d) {
    const sidebar = d3.select("#node-info-content"); // Select the sidebar element
    let info = "";
    if (d.fullname)
      info += `<div><strong>Name:</strong> ${d.fullname}</div><br>`;
    if (d.showname)
      info += `<div><strong>Aka:</strong> ${d.showname}</div><br>`;
    if (d.category)
      info += `<div><strong>Category:</strong> ${d.category}</div><br>`;
    if (d.url)
      info += `<div><strong>URL:</strong> <a href="${d.url}" target="_blank" style="color: blue;">${d.url}</a></div><br>`;
    if (d.description)
      info += `<div><strong>Description:</strong> ${d.description}</div><br>`;

    // Group connections by their 'reason' field and display them
    const groupedConnections = data.links
      .filter((link) => link.source.id === d.id || link.target.id === d.id)
      .reduce((acc, link) => {
        const isSource = link.source.id === d.id;
        const otherNode = isSource
          ? link.target.showname
          : link.source.showname;
        const direction = isSource ? `→` : `←`;
        const linkColor = isSource ? "#4CAF50" : "#FF5722";

        if (!acc[link.reason]) acc[link.reason] = [];
        acc[link.reason].push(
          `<li style="margin-bottom: 8px;"><strong style="color: ${linkColor};">${d.showname}</strong> ${direction} <strong>${otherNode}</strong></li>`
        );
        return acc;
      }, {});

    // Create HTML string by grouping connections under headings
    for (const [reason, connections] of Object.entries(groupedConnections)) {
      info += `<h3>${reason}</h3><ul>${connections.join("")}</ul>`;
    }

    sidebar.html(info); // Update the sidebar with the constructed HTML content
  }

  node.on("click", (event, d) => showInfo(d)); // Attach click event to nodes for showing info
}

// Set up drag functionality to move nodes around
function setupDrag(simulation, node) {
  // Event handler for drag start
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart(); // Increase simulation activity
    d.fx = d.x;
    d.fy = d.y;
  }

  // Event handler for dragging the node
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  // Event handler for drag end
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0); // Reset simulation activity
    d.fx = null;
    d.fy = null;
  }

  node.call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  ); // Attach drag event handlers to nodes
}

// Set up and render links and their labels
function setupLinks(g, data) {
  const filteredLinks = filterLinkLabelsAndArrows(data.links); // Filter out redundant links

  // Draw links as lines between nodes
  const link = g
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(filteredLinks)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke-width", 2)
    .style("stroke", "#aaa")
    .attr("marker-end", "url(#end)"); // Attach arrow markers to end of each link

  // Add labels to the links
  g.append("g")
    .attr("class", "link-labels")
    .selectAll("text")
    .data(filteredLinks)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .attr("dy", 5)
    .attr("text-anchor", "middle")
    .text((d) => d.reason); // Display link 'reason' as label

  return link;
}

// Set up and render nodes with category-based colors and labels
function setupNodes(g, data) {
  const color = d3.scaleOrdinal(d3.schemePaired); // Color scale for different categories

  // Create node elements (circles) for each data node
  const node = g
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .style("fill", (d) => color(d.category)); // Apply category-specific colors

  // Add labels (text) to each node based on their 'showname'
  g.append("g")
    .attr("class", "node-labels")
    .selectAll("text")
    .data(data.nodes)
    .enter()
    .append("text")
    .attr("class", "node-label")
    .attr("dy", -15)
    .attr("text-anchor", "middle")
    .text((d) => d.showname); // Display the 'showname' of each node

  return node; // Return node selection for further use
}

// Add nodes to the force simulation and update positions on each tick
function addNodesToSimulation(simulation, data, link, node) {
  // Update positions of nodes and links on each tick of the simulation
  simulation.nodes(data.nodes).on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    // Update positions of node labels
    d3.selectAll(".node-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y);

    // Update positions of link labels
    d3.selectAll(".link-label")
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2);
  });
}



// Create and render the entire graph with nodes, links, and additional elements
function createGraph(data) {
  const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  };
  const width = window.innerWidth - margin.left - margin.right; // Calculate available width
  const height = window.innerHeight - margin.top - margin.bottom; // Calculate available height

  const g = setupGraphContainer(margin, width, height); // Set up SVG container and return group element

  // Create force simulation for node positioning
  const simulation = d3
    .forceSimulation(data.nodes)
    .force(
      "link",
      d3
        .forceLink(data.links)
        .id((d) => d.id)
        .distance(200)
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Set up and render links
  const link = setupLinks(g, data);
  // Set up and render nodes with labels
  const node = setupNodes(g, data);

  // Attach tooltip functionality to nodes
  setupTooltip(node);
  // Attach information panel display to nodes on click
  setupInfoPanel(node, data);
  // Attach drag functionality to nodes
  setupDrag(simulation, node);

  // Add nodes and links to simulation and handle tick updates
  addNodesToSimulation(simulation, data, link, node);


  
}
