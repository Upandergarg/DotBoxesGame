import React, { useState, useEffect } from 'react';
import './App.css';

// --- Configuration ---
const initialGridSize = 6; // Default size

const getInitialGameState = (size) => {
  return {
    currentPlayer: 1,
    horizontalLines: {},
    verticalLines: {},
    boxes: {},
    scores: { 1: 0, 2: 0 },
    totalBoxes: (size - 1) * (size - 1),
  };
};

function App() {
  const [gridSize, setGridSize] = useState(initialGridSize);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState(getInitialGameState(gridSize));
  const [winner, setWinner] = useState(null);

  const { currentPlayer, horizontalLines, verticalLines, boxes, scores, totalBoxes } = gameState;

  // Effect to check for game over
  useEffect(() => {
    if (gameStarted && Object.keys(boxes).length === totalBoxes && totalBoxes > 0) {
      if (scores[1] > scores[2]) setWinner(1);
      else if (scores[2] > scores[1]) setWinner(2);
      else setWinner('Tie');
    }
  }, [boxes, scores, totalBoxes, gameStarted]);

  // --- Game Actions ---
  const handleStartGame = () => {
    setWinner(null);
    setGameState(getInitialGameState(gridSize));
    setGameStarted(true);
  };

  const handleReturnToMenu = () => {
    setGameStarted(false);
    setGridSize(initialGridSize); // Reset to default
  };

  const handleLineClick = (r, c, type) => {
    if (winner || (type === 'h' && horizontalLines[`${r},${c}`]) || (type === 'v' && verticalLines[`${r},${c}`])) {
      return; // Line already taken or game over
    }

    let boxMade = false;
    const newBoxes = { ...boxes };
    const newScores = { ...scores };
    const newHorizontalLines = { ...horizontalLines };
    const newVerticalLines = { ...verticalLines };

    if (type === 'h') {
      newHorizontalLines[`${r},${c}`] = currentPlayer;
      // Check box above & below
      if (r > 0 && newVerticalLines[`${r-1},${c}`] && newVerticalLines[`${r-1},${c+1}`] && newHorizontalLines[`${r-1},${c}`]) {
        if (!newBoxes[`${r-1},${c}`]) { boxMade = true; newBoxes[`${r-1},${c}`] = currentPlayer; newScores[currentPlayer]++; }
      }
      if (r < gridSize - 1 && newVerticalLines[`${r},${c}`] && newVerticalLines[`${r},${c+1}`] && newHorizontalLines[`${r+1},${c}`]) {
        if (!newBoxes[`${r},${c}`]) { boxMade = true; newBoxes[`${r},${c}`] = currentPlayer; newScores[currentPlayer]++; }
      }
    } else { // type === 'v'
      newVerticalLines[`${r},${c}`] = currentPlayer;
      // Check box left & right
      if (c > 0 && newHorizontalLines[`${r},${c-1}`] && newHorizontalLines[`${r+1},${c-1}`] && newVerticalLines[`${r},${c-1}`]) {
        if (!newBoxes[`${r},${c-1}`]) { boxMade = true; newBoxes[`${r},${c-1}`] = currentPlayer; newScores[currentPlayer]++; }
      }
      if (c < gridSize - 1 && newHorizontalLines[`${r},${c}`] && newHorizontalLines[`${r+1},${c}`] && newVerticalLines[`${r},${c+1}`]) {
        if (!newBoxes[`${r},${c}`]) { boxMade = true; newBoxes[`${r},${c}`] = currentPlayer; newScores[currentPlayer]++; }
      }
    }

    setGameState(prevState => ({
      ...prevState,
      horizontalLines: newHorizontalLines,
      verticalLines: newVerticalLines,
      boxes: newBoxes,
      scores: newScores,
      currentPlayer: boxMade ? prevState.currentPlayer : (prevState.currentPlayer === 1 ? 2 : 1),
    }));
  };

  // --- Render Views ---
  const renderGameBoard = () => {
    // Game Board UI
    const elements = [];
    const boxSize = 60;
    const dotRadius = 5;
    const boardPadding = 20;
    const boardSize = (gridSize - 1) * boxSize + boardPadding * 2;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Render filled boxes
        if (r < gridSize - 1 && c < gridSize - 1) {
          if (boxes[`${r},${c}`]) {
            elements.push(<rect key={`box-${r}-${c}`} className={`box player-box-${boxes[`${r},${c}`]}`} x={c * boxSize} y={r * boxSize} width={boxSize} height={boxSize} />);
          }
        }
        // Render horizontal lines and clickable areas
        if (c < gridSize - 1) {
          elements.push(<g key={`h-group-${r}-${c}`} onClick={() => handleLineClick(r, c, 'h')}><rect className="clickable-area" x={c * boxSize} y={r * boxSize - 10} width={boxSize} height={20} />{horizontalLines[`${r},${c}`] && <line className={`line player-line-${horizontalLines[`${r},${c}`]}`} x1={c * boxSize} y1={r * boxSize} x2={(c + 1) * boxSize} y2={r * boxSize} />}</g>);
        }
        // Render vertical lines and clickable areas
        if (r < gridSize - 1) {
          elements.push(<g key={`v-group-${r}-${c}`} onClick={() => handleLineClick(r, c, 'v')}><rect className="clickable-area" x={c * boxSize - 10} y={r * boxSize} width={20} height={boxSize} />{verticalLines[`${r},${c}`] && <line className={`line player-line-${verticalLines[`${r},${c}`]}`} x1={c * boxSize} y1={r * boxSize} x2={c * boxSize} y2={(r + 1) * boxSize} />}</g>);
        }
        // Render dots on top
        elements.push(<circle key={`dot-${r}-${c}`} className="dot" cx={c * boxSize} cy={r * boxSize} r={dotRadius} />);
      }
    }

    return (
      <div className="game-container">
        <div className="game-header">
          {winner ? (
            <h2 className={`winner-text player-text-${winner === 'Tie' ? 'tie' : winner}`}>{winner === 'Tie' ? "It's a Tie!" : `Player ${winner} Wins!`}</h2>
          ) : (
            <h2>Player <span className={`player-text-${currentPlayer}`}>{currentPlayer}</span>'s Turn</h2>
          )}
        </div>
        <div className="scores">
          <span className={`player-text-1 ${currentPlayer === 1 && !winner ? 'active' : ''}`}>Player 1: {scores[1]}</span>
          <span className={`player-text-2 ${currentPlayer === 2 && !winner ? 'active' : ''}`}>Player 2: {scores[2]}</span>
        </div>
        <div className="board-container">
          <svg width={boardSize} height={boardSize} viewBox={`-${boardPadding} -${boardPadding} ${boardSize} ${boardSize}`}>
            {elements}
          </svg>
        </div>
        <button className="menu-button" onClick={handleReturnToMenu}>
          Back to Menu
        </button>
      </div>
    );
  };
  
  const renderStartScreen = () => {
    // Start Menu UI
    return (
      <div className="start-screen">
        <div className="start-menu-card">
          <h1>Dots and Boxes</h1>
          <p>Select the size of the grid to start.</p>
          <div className="select-container">
            <select onChange={(e) => setGridSize(Number(e.target.value))} defaultValue={initialGridSize}>
              <option value={4}>Small (3x3)</option>
              <option value={6}>Normal (5x5)</option>
              <option value={8}>Large (7x7)</option>
              <option value={10}>Huge (9x9)</option>
            </select>
          </div>
          <button className="start-button" onClick={handleStartGame}>Start Game</button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="video-background">
        <video autoPlay loop muted>
          {/* The video source will be added via the public folder, see instructions below */}
          <source src="/background.mp4" type="video/mp4" />
        </video>
      </div>
      {gameStarted ? renderGameBoard() : renderStartScreen()}
    </div>
  );
}

export default App;