const robot = require('robotjs');
const fliclib = require('./fliclib-linux-hci/clientlib/nodejs/fliclibNodeJs');
const FlicClient = fliclib.FlicClient;
const FlicConnectionChannel = fliclib.FlicConnectionChannel;
const FlicScanner = fliclib.FlicScanner;

var client = new FlicClient('localhost', 5551);

function listenToButton(bdAddr) {
	var cc = new FlicConnectionChannel(bdAddr);
	client.addConnectionChannel(cc);
	cc.on('buttonUpOrDown', function(clickType, wasQueued, timeDiff) {
    // console.log(bdAddr + ' ' + clickType + ' ' + (wasQueued ? 'wasQueued' : 'notQueued') + ' ' + timeDiff + ' seconds ago');

    if (clickType === 'ButtonUp') {
      // console.log('shortcut');
      robot.keyTap('o', ['control', 'alt']);
    }
  });

	cc.on('connectionStatusChanged', function(connectionStatus, disconnectReason) {
		console.log(bdAddr + ' ' + connectionStatus + (connectionStatus == 'Disconnected' ? ' ' + disconnectReason : ''));
	});
}

client.once('ready', function() {
	console.log('Connected to daemon!');
	client.getInfo(function(info) {
		info.bdAddrOfVerifiedButtons.forEach(function(bdAddr) {
			listenToButton(bdAddr);
		});
	});
});

client.on('bluetoothControllerStateChange', function(state) {
	console.log('Bluetooth controller state change: ' + state);
});

client.on('newVerifiedButton', function(bdAddr) {
	console.log('A new button was added: ' + bdAddr);
	listenToButton(bdAddr);
});

client.on('error', function(error) {
	console.log('Daemon connection error: ' + error);
});

client.on('close', function(hadError) {
	console.log('Connection to daemon is now closed');
});
