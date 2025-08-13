window.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('container');
    const diagramDefinition = decodeURIComponent(location.hash.substring(1));

    mermaid.initialize({ startOnLoad: false });

    const { svg } = await mermaid.render('theDiagram', diagramDefinition);
    container.innerHTML = svg;

    const namespaceRects = container.querySelectorAll('g[class$="namespace"] > rect');
    const svgRoot = container.querySelector('svg');

    namespaceRects.forEach(rect => {
        const tab = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tab.setAttribute('x', Number(rect.getAttribute('x')) + 10);
        tab.setAttribute('y', Number(rect.getAttribute('y')) - 12);
        tab.setAttribute('width', '25');
        tab.setAttribute('height', '10');
        tab.setAttribute('fill', '#999');
        svgRoot.appendChild(tab);
    });
});
