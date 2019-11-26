# node_s3_archive_win_service
A windows service which uploads files to S3 and keeps an internal database. After the files are uploaded to S3, the service will delete the files locally.

# Usage

Install node dependencies:
```
npm install
```

Set your environment variables provided in `.env.example`. The ones which are required are `ROOT_FOLDER`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_S3_BUCKET`. 

To run on a schedule manually:
```
node index.js
```

To run only once:
```
node index.js --once
```

To run as a Windows Service which checks process health and restarts in case of failure:
```
node winservice.js --install
```

To uninstall the Windows Service:
```
node winservice.js --uninstall
```
