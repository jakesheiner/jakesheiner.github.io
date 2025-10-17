const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  const squareSize = 30; // Cell size of 30x30 pixels
  const rows = canvas.height / squareSize;
  const cols = canvas.width / squareSize;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(false));
  let isDragging = false;

  // Add clear button functionality
document.getElementById('clearCanvas').addEventListener('click', () => {
  // Reset the grid array
  for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
          grid[row][col] = false;
      }
  }
  // Redraw the empty grid
  drawGrid();
});

  // Preload two versions of each SVG image (with and without window), plus one piece with no window version
  const svgImages = {
    tower: [new Image(), new Image()],
    wall: [new Image(), new Image()],
    archLeft: [new Image(), new Image()],
    archRight: [new Image(), new Image()],
    balcony: [new Image()],  // Gate only has one version
    archBoth: [new Image(), new Image()],
    stack: [new Image(), new Image()]
  };

  // Specify image sources for each version (with window and without window)
  svgImages.tower[0].src = 'tower.svg';           // Without window
  svgImages.tower[1].src = 'towerWindow.svg';     // With window
  
  svgImages.wall[0].src = 'wall.svg';             // Without window
  svgImages.wall[1].src = 'wallWindow.svg';       // With window
  
  svgImages.archLeft[0].src = 'archLeft.svg';     // Without window
  svgImages.archLeft[1].src = 'archLeftWindow.svg'; // With window
  
  svgImages.archRight[0].src = 'archRight.svg';   // Without window
  svgImages.archRight[1].src = 'archRightWindow.svg'; // With window

  svgImages.archBoth[0].src = 'archBoth.svg';
  svgImages.archBoth[1].src = 'archBothWindow.svg'
  
  svgImages.balcony[0].src = 'balcony.svg';             // No window version, only one version

  svgImages.stack[0].src = 'stack.svg';
  svgImages.stack[1].src ='stack.svg';
  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background cells first
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.fillStyle = "#00bfff"; // Sky blue background for the grid
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }

    // Then draw the pieces on top of the background cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const type = determineCastlePiece(row, col);

        if (type) {
          // Randomly choose between two versions of the piece (50/50 chance for windowed types)
          let randomVersion;
          if (svgImages[type].length === 1) {
            // If the piece only has one version, don't randomize
            randomVersion = 0;  // Always use the first (only) version
          } else {
            // For pieces with multiple versions (e.g., tower, wall), we randomly pick between them
            randomVersion = Math.floor(Math.random() * 3);  // 0, 1, or 2
            // If randomVersion is 2, use the windowed version
            randomVersion = randomVersion === 2 ? 1 : 0;
          }

          // Get the selected image for this piece type
          const selectedImage = svgImages[type][randomVersion];

          // Calculate the position to center the image on the current cell
          const x = col * squareSize - 30; // Adjust to draw the image so that it covers 3x3 cells
          const y = row * squareSize - 30; // Adjust to draw the image so that it covers 3x3 cells

          // Draw the image, centered over the clicked cell, with 90x90 size
          ctx.drawImage(selectedImage, x, y, 90, 90);
        }
      }
    }
  }

  // Determine castle piece type based on 8 neighboring squares
  function determineCastlePiece(row, col) {
    if (!grid[row][col]) return null;

    const top = row > 0 && grid[row - 1][col];
    const bottom = row < rows - 1 && grid[row + 1][col];
    const left = col > 0 && grid[row][col - 1];
    const right = col < cols - 1 && grid[row][col + 1];
    const topLeft = row > 0 && col > 0 && grid[row - 1][col - 1];
    const topRight = row > 0 && col < cols - 1 && grid[row - 1][col + 1];
    const bottomLeft = row < rows - 1 && col > 0 && grid[row + 1][col - 1];
    const bottomRight = row < rows - 1 && col < cols - 1 && grid[row + 1][col + 1];

    if (!top && !left && !right && !topLeft && !topRight) {
      return "tower";
    }
    if(!left && !right && topLeft && topRight){
      return "archBoth";
    }
    if (topLeft && !left) {
      return "archLeft";
    }

    if (topRight && !right) {
      return "archRight";
    }

    if (( !topLeft && !topRight) && (!bottomLeft || !bottomRight) && top) {
      return "stack";
    }

    if ((left || right) && ( !topLeft && !topRight)) {
      return "wall";
    }


    if ((left || right) && ( topLeft || topRight) && !top) {
      return "wall";
    }
    
  //  if (left && right && top && topLeft && topRight && bottom && bottomLeft && bottomRight) {
   //   return "balcony";
   // }

    // If there is an open area with no adjacent squares, place a gate (example for testing)
    return "stack"; // You can modify the logic to place the gate conditionally
  }

  // shift-click to clear function
  function clearSquare(row, col) {
    if (row >= 0 && row < rows && col >= 0 && col < cols && grid[row][col]) {
        grid[row][col] = false;
        drawGrid();
    }
}
  //end shift-click to clear

  function lightUpSquare(row, col) {
    if (row >= 0 && row < rows && col >= 0 && col < cols && !grid[row][col]) {
      grid[row][col] = true;
      drawGrid();
    }
  }

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });


canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  const col = Math.floor(e.offsetX / squareSize);
  const row = Math.floor(e.offsetY / squareSize);
  if (e.shiftKey) {
      clearSquare(row, col);
  } else {
      lightUpSquare(row, col);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
      const col = Math.floor(e.offsetX / squareSize);
      const row = Math.floor(e.offsetY / squareSize);
      if (e.shiftKey) {
          clearSquare(row, col);
      } else {
          lightUpSquare(row, col);
      }
  }
});

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  drawGrid();

