var jetpack = require('fs-jetpack');
var fp = require('path');
var async = require('async');
var md5file = require('./md5file');

function checkfiles(files, dst, complete) {
	var invalidfiles = [];
	async.each(files, function (file, next) {
		var localfile = fp.join(dst, file.file);
		async.waterfall([
			function (next) {
				if (!jetpack.exists(localfile)) {
					next('no file');
				}
				md5file(localfile, next);
			},
			function (md5, next) {
				next((md5 != file.md5) ? 'not match' : null);
			}
		], function (err) {
			if (err) {
				invalidfiles.push(file.file);
			}
			next();
		});
	}, function (err) {
		complete(err, invalidfiles);
	});	
}

function server(port, password, dst) {
	var io = require('socket.io')(port);
	console.log('listening on port %s', port);
	io.on('connection', function (socket) {
		var authed = false;
		socket.on('auth', function (pw) {
			if (password == pw) {
				authed = true;
				console.log('client logged in');
				socket.emit('message', 'login successful');
			}
		});
		socket.on('files', function (files) {
			if (!authed) {
				return console.log('user not authed and is trying to do shit');
			}
			checkfiles(files, dst, function (err, files) {
				if (err) return console.log('error', err);
				socket.emit('sendfiles', files);
			});
		});

		socket.on('save', function (file) {
			if (!authed) {
				return console.log('user not authed and is trying to do shit');
			}
			console.log('save %s', file.file);
			var path = fp.join(dst, file.file);
			jetpack.write(path, file.content);
		});

		socket.on('delete', function (file) {
			if (!authed) {
				return console.log('user not authed and is trying to do shit');
			}
			console.log('delete %s', file);
			jetpack.remove(fp.join(dst, file));
		});
		
		socket.on('disconnect', function () {
			console.log('client disconnected');
		});
	});
}

module.exports = server;