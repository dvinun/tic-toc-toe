import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props)
{
  if(props.winnerSquare)
  {
    return (
      <button className="winner-square" onClick={() => props.onClick()}>{props.value}</button>
    );
  }
  else
    return (
      <button className="square" onClick={() => props.onClick()}>{props.value}</button>
    );
}

class Board extends React.Component {

  renderSquare(i, winnerSquare) {
    return <Square
             value={this.props.squares[i]} 
             winnerSquare= {winnerSquare}
             onClick={() => this.props.onClick(i)}
             />;
  }

  renderSquares()
  {
    const width = 3, height = 3;
    var rows = [];
    const winnerSquares = this.props.winnerSquares;
    
    for (var y = 0; y < height; y++) {
      var squares = [];
      for (var x = 0; x < width; x++) {
          const squareIndex = x + (y * width);
          squares.push(this.renderSquare(squareIndex, winnerSquares ? 
            (winnerSquares.find((item) => {return item == squareIndex; }) >= 0) : false));
      }
      rows.push( <div className="board-row">{squares}</div> );
    }
   return (
     <div>{rows}</div>
   )
  }

  render() {
    return (
      <div>
        {this.renderSquares()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props)
    {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      isXNext: true,
      currentStep: 0,
      gamelog: [],
      movesOrder: 'Asc',
    };
  }

  handleClick(i)
  {
    const history = this.state.history.slice(0,this.state.currentStep+1);
    const current = history[history.length-1];
    const log = 'Player ' + (this.state.isXNext ? 'X' : 'O') + ' clicked on (' + Math.floor(i/3) + ',' + i%3 + ')';
    
    if(calculateWinner(current.squares) || current.squares[i]) 
    {
      return; 
    }

    const squares = current.squares.slice();

    squares[i] = this.state.isXNext ? 'X': 'O';

    this.setState({
      history: history.concat([{squares: squares.slice()}]),
      isXNext: !this.state.isXNext,
      currentStep: this.state.currentStep+1,
      gamelog: this.state.gamelog.concat([log]),
    });
  }

  onClickGoToMove(move)
  {
    this.setState({
      currentStep: move,
      isXNext: (move % 2) === 0
    });
  }

  getHistoryWithMoves()
  {
    var moveOrderNegation = 0;
    if(this.state.movesOrder == 'Desc') 
      moveOrderNegation = Math.abs(this.state.history.length-1); 
    
    return this.state.history.map((history, moveNumber)=> {
        var moveNumberSorted = Math.abs(moveOrderNegation-moveNumber);
        const desc = moveNumberSorted > 0 ? 'Go to move #' + moveNumberSorted : 'Go to start of the game';
        return (
          <li key={moveNumberSorted}><button className='move-to-button' onClick={() => {this.onClickGoToMove(moveNumberSorted)}}>{desc}</button> </li>
        );
    });
  }

  flipMovesOrder()
  {
    this.setState({
      movesOrder: this.state.movesOrder == 'Asc' ? 'Desc' : 'Asc',
    });
  }

  getGameLog(){
    return this.state.gamelog.map((log, logId) => {
      return (
        <li key={logId}> {log} </li>
      );
    });
  }

  isAllSquaresFilled()
  {
    const current = this.state.history[this.state.currentStep];
    var allSquaresFilled = true;
    current.squares.map((value, index) => {
      if(!value) allSquaresFilled = false;
    });
    return allSquaresFilled;
  }

  render() {
    const current = this.state.history[this.state.currentStep];
    const winner = calculateWinner(current.squares);
    const allSquaresFilled = this.isAllSquaresFilled();
    const moves = this.getHistoryWithMoves();
    const gamelog = this.getGameLog();
    const sortAscDesc = this.state.movesOrder == 'Asc' ? '(Sort oldest first)' : '(Sort newest first)'; 

    let status;
    if(winner)
    {
        status = 'Winner: ' + current.squares[winner[0]];
    }
    else if(allSquaresFilled)
    {
        status = 'Game Over. Its draw!';
    }
    else
    {
        status = 'Next player: ' + (this.state.isXNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
          squares={current.squares}
          winnerSquares = {winner}
          onClick={(i) => this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div>{status} </div>
          <br/>
          <div align='left' ><a href='#' onClick={() => this.flipMovesOrder()}>{sortAscDesc}</a></div>
          <div className="game-info-container" >
            <ol>{moves}</ol>
          </div>
        </div>
        <div className="game-log">
          <div>Game Log</div>
          <div className="game-log-container" >
            <ol>{gamelog}</ol>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}