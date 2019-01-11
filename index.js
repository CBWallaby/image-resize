//index.js

/**
 * Triggered from a change to a Cloud Storage bucket.
 *
 * @param {!Object} event Event payload and metadata.
 * @param {!Function} callback Callback function to signal completion.
 */
const storage = require('@google-cloud/storage')();
const gm = require('gm').subClass({imageMagick: true});

const bucket = "source-bucket.example.com";
const destPrefix = "thumbnails/";
const width = 50
const height = 50
const option = "^"
const quality = 75

exports.main = (event, callback) => {
  const filename = event.data.name;
 
 if(!filename) {
    callback();
    return;
  }
  
  console.log(`Processing file: ${filename}`);
  
  if(filename.indexOf(destPrefix) > -1) {
    callback();
    return;
  }
  
  const file = storage.bucket(bucket).file(filename);

  let stream = file.createReadStream()

  const thumbFileName = `${destPrefix}${filename}`;
  console.log(`Destination: ${thumbFileName}`);
  
  const dest = storage.bucket(bucket).file(thumbFileName);
  let thumbnailUploadStream = dest.createWriteStream();
  

  gm(stream)
    .autoOrient()
    .resize(width, height, option)
    .quality(quality)
    .stream()
    .pipe(thumbnailUploadStream);

  const streamAsPromise = new Promise((resolve, reject) =>
    thumbnailUploadStream.on('finish', resolve).on('error', reject)
);
  
  streamAsPromise.then(() => {
    console.log('Served: ' + filename );
    callback();
  });

};