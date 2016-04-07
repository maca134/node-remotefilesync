# Node Remote File Sync - [Downloads](https://www.npmjs.com/package/remotefilesync)
A node module to sync files (1 way) that works on both windows and linux. Files are pushed to the server as they are created/changed/deleted. There is a flag to sync all the files at startup (this will not delete files on the server).

### Install
```
npm install -g remotefilesync
```

### Client (source)
remotefilesync --mode=client --host=127.0.0.1:4000 --password=hello --target=C:\path\to\src

### Server (destination)
remotefilesync --mode=server --port=4000 --password=hello --target=/path/to/dest

### Usage
```
-h, --help                 output usage information
-V, --version              output the version number
-m, --mode <mode>          mode (server|client)
-h, --host <host>          host (client mode)
-p, --port <port>          port (server mode)
-d, --password <password>  password (client|server mode)
-t, --target <target>      target path (client|server mode)
-s, --sync                 sync files at startup (client mode)

```