document.addEventListener('DOMContentLoaded', (event) => {
    const gameSocket = io();

    gameSocket.on('connect', () => {
        console.log('Connected to server');

        // Assume gameId is retrieved from somewhere in your page, e.g., a hidden input or element
        const gameId = document.getElementById('gameIdSpan').textContent;
        gameSocket.emit('joinGame', gameId);
    });


});