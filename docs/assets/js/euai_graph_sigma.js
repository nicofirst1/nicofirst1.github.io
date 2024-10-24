
// Global variables for original data and category filters
const container = document.getElementById("graph_container");
const categoryListContainer = document.querySelector(
  ".category_list_container"
);
const modal = document.querySelector(".modal");
const slider= document.getElementById("connectionSlider");



const categoryColorMap = {};
let activeFilters = new Set();
let nodeClicked = false;
let nodeDragged = false;
let nodeDraggedCheckForTooltip = false;
let checkForReset = false;
let euai_data;

slider.addEventListener("input", (event) => {
    const connectionThreshold = parseInt(event.target.value, 10);
    filterGraphByConnections(euai_data, connectionThreshold); // Use the slider value to filter
  });

// Function to reset the graph to its original state
document.querySelector(".reset_btn").addEventListener("click", () => {
  checkForReset = true;
  initializeGraph(euai_data);
  document.getElementById("connectionSlider").value = 0; // Reset the slider value
});

document.querySelector(".close").addEventListener("click", closeModal);
document.querySelector(".overlay").addEventListener("click", closeModal);

// Set up local storage to check if the user has visited the site before and show the modal if they are visiting for the first time
if (!localStorage.getItem("visited")) {
  localStorage.setItem("visited", true);
  modalDisplay();
} else {
  closeModal();
}


// FUNCTION DEFINITIONS 

// Function to fetch and process the JSON data
function getEuaiData(callback) {
  fetch(euai_data_url)
    .then(response => response.json())
    .then(data => {
      euai_data = data;
      console.log('euai_data:', euai_data);
      callback(data);
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
}


// Initialize the graph with the provided data
function modalDisplay() {
  modal.style.display = "block";
  const categories = Array.from(
    new Set(euai_data.nodes.map((node) => node.category).sort())
  );

  categories.forEach((category) => {
    const div = document.createElement("div");
    div.className = "interest_item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = category;
    checkbox.checked = false;
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        activeFilters.add(category);
      } else {
        activeFilters.delete(category);
      }
    });

    const label = document.createElement("label");
    label.htmlFor = category;
    label.textContent = category;

    div.appendChild(checkbox);
    div.appendChild(label);

    document.querySelector(".interests_list").appendChild(div);
  });

  document.querySelector(".submit_btn").addEventListener("click", () => {
    if (activeFilters.size === 0) {
      closeModal();
      return;
    }
   
    initializeGraph(euai_data);
    filterGraph(euai_data);
    modal.style.display = "none";
  });
}

function closeModal() {
  modal.style.display = "none";
  if (activeFilters.size === 0) {
    // If no filters are selected, show the entire graph and set all filters as active
    // activeFilters = new Set(euai_data.nodes.map((node) => node.category));

    initializeGraph(euai_data);
  }
}


// Function to initialize the graph with validated data
function initializeGraph(data) {

  if(!data){
    console.log('Data not defined, fetching data from euai_data_url');
    getEuaiData(initializeGraph);
    return;
  }
  
  // Initialize category color map globally
  initializeCategoryColors(data.nodes);

  // Add a legend for toggling categories
  addCategoryLegend(data);

  if (data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
    const { nodes, links } = validateData(data); // Validate and filter nodes and links

    
    createGraph({ nodes, links }); // Call createGraph with validated data
  } else {
    console.error(
      "Error: Data format is incorrect or nodes/links are missing."
    );
  }
}

// Function to initialize the category colors
function initializeCategoryColors(nodes) {
  const categories = Array.from(new Set(nodes.map((node) => node.category))); // Get unique categories

  // Define a color scheme
  const colorScheme = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    "#ffff99",
    "#b15928",
  ];

  // Assign colors to each category in the global categoryColorMap
  categories.forEach((category, index) => {
    categoryColorMap[category] = colorScheme[index];
  });
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

  console.log('links:', links);
  links.forEach((link) => {
    const pairId = `${link.source}-${link.target}`; // Unique identifier for the link
    const reversePairId = `${link.target}-${link.source}`; // Unique identifier for reverse direction

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
  }
);


  return Object.values(linkMap); // Return the filtered links as an array
}

// Create and render the entire graph with nodes in Sigma.js, links, and additional elements
function createGraph(data) {
  const graph = new graphology.Graph();  // Note the lowercase 'graphology'

  // Clear previous graph elements, if any
  container.innerHTML = "";

  data.nodes.forEach((node, index) => {
    graph.addNode(node.id, {
      label: node.id,
      size: 8,
      color: categoryColorMap[node.category] || "#999",
      forceLabel: true,
    });
  });

  graph.nodes().forEach((node, i) => {
    const angle = (i * 2 * Math.PI) / graph.order;
    graph.setNodeAttribute(node, "x", 1000 * Math.cos(angle));
    graph.setNodeAttribute(node, "y", 1000 * Math.sin(angle));
  });

  // Set to track unique edges
  const uniqueEdges = new Set();

  // Add edges (links) between nodes, filtering duplicates
  filterLinkLabelsAndArrows(data.links).forEach((link) => {
    const edgeId = `${link.source}-${link.target}`; // Create a unique key for the edge
    //const reverseEdgeId = `${link.target}-${link.source}`; // Also consider reverse direction

    if (!uniqueEdges.has(edgeId) ) {
      graph.addEdge(link.source, link.target, {
        type: "arrow",
        label: link.reason,
        size: 2,
        color: "#ccc",
        forceLabel: true,
      });
      uniqueEdges.add(edgeId);
    }
  });

  // Use ForceAtlas2 layout for dynamic positioning of nodes
  const fa2Layout = new graphologyLibrary.ForceLayout
  (graph, {
    isNodeFixed: (_, attr) => attr.highlighted,
    settings: {
      scalingRatio: 200,
      strongGravityMode: false,
    },
  });

  fa2Layout.start(); // Start the layout process

  // Instantiate sigma.js and render the graph
  const renderer = new Sigma(graph, container, {
    renderEdgeLabels: true, // Render edge labels
    labelRenderedSizeThreshold: 0, // Ensure all labels are rendered
    edgeLabelThreshold: 0, // Ensure all edge labels are rendered
    minArrowSize: 80, // Control the size of the arrow
    
  });

  // Handle label resizing based on zoom level
  renderer.getCamera().on("updated", () => {
    const zoomLevel = renderer.getCamera().ratio;

    // Adjust node label size dynamically based on zoom
    graph.forEachNode((node) => {
      const adjustedNodeSize = Math.max(12 / zoomLevel);
      renderer.setSetting("labelSize", adjustedNodeSize); // Set label size for nodes
    });

    // Adjust edge label size dynamically based on zoom
    graph.forEachEdge((edge) => {
      const adjustedEdgeSize = Math.max(12 / zoomLevel / 1.2);
      renderer.setSetting("edgeLabelSize", adjustedEdgeSize); // Set label size for edges
    });
  });

  // Set up Drag'n'drop feature for the nodes
  setupDragAndDrop(graph, renderer);

  // Add event listeners for node clicks and canvas clicks
  setupClickHighlight(graph, renderer, data);

  // Set up the tooltip for displaying node information on hover
  setupTooltip(renderer, data);

  // Stop the layout after 5 seconds to freeze positions
  //setTimeout(() => fa2Layout.kill(), 5000);
}

// Function to add a legend for toggling categories
function addCategoryLegend(data) {
  if (checkForReset) return;

  const categories = Array.from(
    new Set(data.nodes.map((node) => node.category))
  ); // Get unique categories

  // sort alphabetically
  categories.sort();

  // Create a checkbox for each category
  categories.forEach((category) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = category;
    // Based on the checkbox state, check or uncheck the checkbox from active filters
    activeFilters.has(category)
      ? (checkbox.checked = true)
      : (checkbox.checked = false);

    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        activeFilters.add(category);
      } else {
        activeFilters.delete(category);
      }
      filterGraph(data);
    });

    const label = document.createElement("label");
    label.htmlFor = category;
    label.textContent = category;
    label.style.color = categoryColorMap[category];

    const div = document.createElement("div");
    div.className = "category_item";
    div.appendChild(checkbox);
    div.appendChild(label);

    categoryListContainer.appendChild(div);
  });
}

// Function to filter the graph based on active category filters
function filterGraph(data) {
  const filteredNodes = data.nodes.filter((node) =>
    activeFilters.has(node.category)
  ); // Filter nodes based on active category filters

  const filteredLinks = filterLinkLabelsAndArrows(data.links).filter(
    (link) =>
      activeFilters.has(link.source.category) &&
      activeFilters.has(link.target.category)
  ); // Filter links based on active category filters

  createGraph({ nodes: filteredNodes, links: filteredLinks }); // Create the graph with filtered data
}

// Set up the tooltip for displaying node information on hover
function setupTooltip(renderer, data) {
  const tooltip = document.querySelector(".tooltip");

  renderer.on("enterNode", ({ node, event }) => {
    if (nodeDraggedCheckForTooltip) return; // Prevent showing tooltip when dragging a node
    container.style.cursor = "pointer";
    const fullname = data.nodes.find((n) => n.id === node).fullname;
    tooltip.innerHTML = fullname;
    tooltip.style.display = "block";
    // Get the mouse position from the event object
    const mouseX = event.x;
    const mouseY = event.y;

    tooltip.style.left = mouseX + 460 + "px";
    tooltip.style.top = mouseY - 30 + "px";
    tooltip.style.opacity = "1";
  });

  renderer.on("leaveNode", ({ node }) => {
    container.style.cursor = "default";
    tooltip.style.display = "none";
  });
}

// Set up Drag'n'drop feature for the nodes
function setupDragAndDrop(graph, renderer) {
  // State for drag'n'drop
  let draggedNode = null;
  let isDragging = false;

  renderer.on("downNode", (e) => {
    isDragging = true;
    draggedNode = e.node;
    nodeDraggedCheckForTooltip = true;
    graph.setNodeAttribute(draggedNode, "highlighted", true);
  });

  // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
  renderer.getMouseCaptor().on("mousemovebody", (e) => {
    if (!isDragging || !draggedNode) return;

    if (!nodeClicked) nodeDragged = true;

    // Get new position of node
    const pos = renderer.viewportToGraph(e);

    // Set the new position of the dragged node
    graph.setNodeAttribute(draggedNode, "x", pos.x);
    graph.setNodeAttribute(draggedNode, "y", pos.y);

    // Prevent Sigma from moving the camera:
    e.preventSigmaDefault();
    e.original.preventDefault();
    e.original.stopPropagation();
  });

  // On mouse up, we reset the autoscale and the dragging mode
  renderer.getMouseCaptor().on("mouseup", () => {
    if (draggedNode) {
      graph.removeNodeAttribute(draggedNode, "highlighted");
    }
    isDragging = false;
    draggedNode = null;
    nodeDraggedCheckForTooltip = false;
    setTimeout(() => {
      nodeDragged = false;
    }, 100); // Reset nodeDragged after 100ms
  });

  // Disable the autoscale at the first down interaction
  renderer.getMouseCaptor().on("mousedown", () => {
    if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
  });
}

// Function to update styles based on highlights
function updateStyles(graph, renderer, data) {
  let i = 0;
  graph.forEachNode((node, attributes) => {
    const color = attributes.highlighted
      ? categoryColorMap[data.nodes[i].category]
      : nodeClicked
      ? "rgba(0, 0, 0, 0)"
      : categoryColorMap[data.nodes[i].category]; // Dim unhighlighted nodes
    graph.setNodeAttribute(node, "color", color); // Set node color
    i++;
  });

  graph.forEachEdge((edge, attributes) => {
    const color = attributes.highlighted
      ? "rgba(0, 0, 0, 0.5)"
      : nodeClicked
      ? "rgba(0, 0, 0, 0)"
      : "#ccc"; // Dim unhighlighted edges
    const labelColor = attributes.highlighted
      ? "#000"
      : nodeClicked
      ? "rgba(0, 0, 0, 0)"
      : "#ccc"; // Dim unhighlighted labels
    graph.setEdgeAttribute(edge, "size", attributes.highlighted ? 4 : 2);
    graph.setEdgeAttribute(edge, "color", color);
    graph.setEdgeAttribute(edge, "labelColor", labelColor); // Set label color
  });

  renderer.refresh();
}

// Function to reset highlights
function resetHighlights(graph) {
  graph.forEachNode((node) => {
    graph.removeNodeAttribute(node, "highlighted");
    graph.removeNodeAttribute(node, "hidden");
  });
  graph.forEachEdge((edge) => {
    graph.removeEdgeAttribute(edge, "highlighted");
  });
}

// Function to setup click highlight and show node info
function setupClickHighlight(graph, renderer, data) {
  // Handle node click event
  renderer.on("clickNode", ({ node }) => {
    if (nodeDragged) return; // Prevent showing info when dragging a node
    showInfo(
      data.nodes.find((n) => n.id === node),
      data
    );

    nodeClicked = true;
    // Reset previous highlights
    resetHighlights(graph);

    // Highlight clicked node
    graph.setNodeAttribute(node, "highlighted", true);

    // Track connected nodes
    const connectedNodes = new Set();
    connectedNodes.add(node);

    // Highlight connected edges and nodes
    graph.forEachEdge(node, (edge, attributes, source, target) => {
      graph.setEdgeAttribute(edge, "highlighted", true);
      graph.setNodeAttribute(source, "highlighted", true); // Highlight source node
      graph.setNodeAttribute(target, "highlighted", true); // Highlight target node
      connectedNodes.add(source);
      connectedNodes.add(target);
    });

    // Hide non-highlighted nodes
    graph.forEachNode((n) => {
      if (!connectedNodes.has(n)) {
        graph.setNodeAttribute(n, "hidden", true);
      }
    });

    // Update styles
    updateStyles(graph, renderer, data);
  });

  // Handle canvas click event to reset highlights
  renderer.getMouseCaptor().on("click", (event) => {
    if (nodeDragged) return; // Prevent resetting highlights when dragging a node

    if (event.original.target.tagName === "CANVAS") {
      if (!nodeClicked) {
        resetHighlights(graph);
        updateStyles(graph, renderer, data);
        document.querySelector(".node_info_display").innerHTML = ""; // Clear the node info display
      }
      nodeClicked = false;
    }
  });
}

// Show detailed node information in the sidebar
function showInfo(d, data) {
  const sidebar = document.querySelector(".node_info_display"); // Select the sidebar element

  let info = "";

  // Define a mapping for field names to display labels and formatters
  const fieldMappings = {
    fullname: {
      label: "Name",
      format: (value) => value,
    },
    showname: {
      label: "Aka",
      format: (value) => value,
    },
    category: {
      label: "Category",
      format: (value) => value,
    },
    url: {
      label: "URL",
      format: (value) =>
        `<a href="${value}" target="_blank">
            ${value}
          </a>`,
    },
    startDate: {
      label: "Start Date",
      format: (value) => value,
    },
    endDate: {
      label: "End Date",
      format: (value) => value,
    },
    budget: {
      label: "Budget",
      format: (value) => `€ ${value}`,
    },
    proposalUrl: {
      label: "Proposal URL",
      format: (value) =>
        `<a href="${value}" target="_blank">
            ${value}
          </a>`,
    },
    coordinator: {
      label: "Coordinator",
      format: (value) => value,
    },
    coordinatingInstitution: {
      label: "Coordinating Institution",
      format: (value) => value,
    },
  };

  // Build the HTML content dynamically based on the mapping
  Object.keys(fieldMappings).forEach((key) => {
    if (d[key]) {
      // Check if the field is present in the data
      const { label, format } = fieldMappings[key];
      info += `<div><strong>${label}:</strong> ${format(d[key])}</div><br>`;
    }
  });

  // Group connections by their 'reason' field and display them

  const groupedConnections = data.links
    .filter((link) => link.source.id === d.id || link.target.id === d.id)
    .reduce((acc, link) => {
      const isSource = link.source.id === d.id;
      const otherNode = isSource ? link.target.showname : link.source.showname;
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

  sidebar.innerHTML = info; // Update the sidebar with the constructed HTML content
}

// Function to filter the graph based on the number of connections
function filterGraphByConnections(data, connectionThreshold) {
  const filteredNodes = data.nodes.filter((node) => {
    const nodeConnections = data.links.filter(
      (link) => link.source.id === node.id || link.target.id === node.id
    );
    return nodeConnections.length <= connectionThreshold; // Only keep nodes with connections <= threshold
  });

  const filteredLinks = data.links.filter((link) => {
    return (
      filteredNodes.some((n) => n.id === link.source.id) &&
      filteredNodes.some((n) => n.id === link.target.id)
    ); // Only keep links where both source and target nodes are included
  });

  // Recreate the graph with filtered data
  createGraph({ nodes: filteredNodes, links: filteredLinks });
}

// Initialize the slider and filter the graph based on the slider value
function initializeSlider(data) {
  // Create a mapping of nodes to their edge count
  const nodeEdgeCount = {};

  data.links.forEach((link) => {
    if (!nodeEdgeCount[link.source.id]) nodeEdgeCount[link.source.id] = 0;
    if (!nodeEdgeCount[link.target.id]) nodeEdgeCount[link.target.id] = 0;
    nodeEdgeCount[link.source.id]++;
    nodeEdgeCount[link.target.id]++;
  });

  // Find the minimum and maximum number of edges for any node
  const edgeCounts = Object.values(nodeEdgeCount);
  const minEdges = Math.min(...edgeCounts);
  const maxEdges = Math.max(...edgeCounts);

  // Set the slider min and max values dynamically based on edge counts
  const slider = document.getElementById("connectionSlider");
  slider.min = minEdges;
  slider.max = maxEdges;
  slider.value = minEdges; // Start with the minimum value
}
