document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      document.getElementById('textInput').value = evt.target.result;
    };
    reader.readAsText(file);
  }
});

document.getElementById('compressBtn').addEventListener('click', () => {
  const text = document.getElementById('textInput').value.trim();
  if (!text) return alert("Please enter or upload some text!");
  const result = huffmanCompress(text);
  showResults(result);
});

document.getElementById('decodeBtn').addEventListener('click', () => {
  if (!window.lastEncoded) return alert("Please compress first!");
  const decoded = decodeData(window.lastEncoded, window.lastTree);
  document.getElementById('results').innerHTML += `
    <h3>🔓 Decoded Data</h3>
    <pre>${decoded}</pre>
  `;
});

function buildFrequencyTable(text) {
  const freq = {};
  for (let ch of text) freq[ch] = (freq[ch] || 0) + 1;
  return freq;
}

function buildHuffmanTree(freq) {
  let nodes = Object.entries(freq).map(([ch, freq]) => ({ ch, freq }));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    nodes.push({ freq: left.freq + right.freq, left, right });
  }
  return nodes[0];
}

function buildCodeTable(node, prefix = '', table = {}) {
  if (node.ch) {
    table[node.ch] = prefix;
  } else {
    buildCodeTable(node.left, prefix + '0', table);
    buildCodeTable(node.right, prefix + '1', table);
  }
  return table;
}

function encodeData(text, codeTable) {
  return text.split('').map(ch => codeTable[ch]).join('');
}

function decodeData(encoded, tree) {
  let node = tree, decoded = '';
  for (let bit of encoded) {
    node = bit === '0' ? node.left : node.right;
    if (node.ch) {
      decoded += node.ch;
      node = tree;
    }
  }
  return decoded;
}

function huffmanCompress(text) {
  const freqTable = buildFrequencyTable(text);
  const tree = buildHuffmanTree(freqTable);
  const codeTable = buildCodeTable(tree);
  const encoded = encodeData(text, codeTable);

  const originalSize = text.length * 8;
  const compressedSize = encoded.length;
  const ratio = (compressedSize / originalSize).toFixed(2);
  const percentage = (100 - ratio * 100).toFixed(2);

  window.lastEncoded = encoded;
  window.lastTree = tree;

  return {
    freqTable, codeTable, encoded,
    originalSize, compressedSize, ratio, percentage
  };
}

function showResults(r) {
  const freqTableHTML = Object.entries(r.freqTable)
    .map(([ch, f]) => `<tr><td>${ch === ' ' ? '(space)' : ch}</td><td>${f}</td></tr>`)
    .join('');
  const codeTableHTML = Object.entries(r.codeTable)
    .map(([ch, code]) => `<tr><td>${ch === ' ' ? '(space)' : ch}</td><td>${code}</td></tr>`)
    .join('');

  document.getElementById('results').innerHTML = `
    <h3>Frequency Table</h3>
    <table><tr><th>Character</th><th>Frequency</th></tr>${freqTableHTML}</table>
    <h3>Huffman Code Table</h3>
    <table><tr><th>Character</th><th>Code</th></tr>${codeTableHTML}</table>
    <h3>Encoded Data</h3>
    <pre>${r.encoded}</pre>
    <h3>File Stats</h3>
    <p>Original Size: ${r.originalSize} bits</p>
    <p>Compressed Size: ${r.compressedSize} bits</p>
    <p>Compression Ratio: ${r.ratio}</p>
    <p>Compression Percentage: ${r.percentage}%</p>
  `;
}

