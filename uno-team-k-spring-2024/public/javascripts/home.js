const gameSocket = io();


document.addEventListener('DOMContentLoaded', () => {
 // Connect event
    gameSocket.on('connect', () => {
        console.log('Connected to server');
    });
    // Get all join forms
    const forms = document.querySelectorAll('form[id^="joinGameForm-"]');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Retrieve gameId from the form's action attribute or the form's ID
            const gameId = this.id.split('-').pop(); // Since ID is 'joinGameForm-<gameId>'
            //calling emit on button press prevents socket rejoins on refresh
            //Probably not necessary since socketIO has robust handling but doesn't hurt
            // Emit the join game event
            gameSocket.emit('joinGame', gameId);

            setTimeout(() => {
                this.submit();
            }, 500); // Adjust delay as necessary
        });
    });
});