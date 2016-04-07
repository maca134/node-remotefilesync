var fs = require('fs');
var crypto = require('crypto');

function md5file(file, complete) {
	var hash = crypto.createHash('md5');
	var stream = fs.createReadStream(file);
	stream.on('data', function (data) {
		hash.update(data, 'utf8')
	});
	stream.on('end', function () {
		complete(null, hash.digest('hex'));
	});
	stream.on('error', function (err) {
		complete(null, '');
	});
}

module.exports = md5file;